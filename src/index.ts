/**
 * Cloudflare Worker for capturing screenshots and sending to Discord
 * Triggered daily at midnight UTC via cron schedule
 */
import { launch, type BrowserWorker, type Page } from '@cloudflare/playwright';

interface Environment {
  TARGET_URL: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_CHANNEL_ID: string;
  BROWSER: BrowserWorker;
}

export default {
  async scheduled(event: ScheduledEvent, env: Environment, ctx: ExecutionContext): Promise<void> {
    console.log('Starting scheduled screenshot capture job...');
    
    try {
      const screenshot = await captureScreenshot(env.TARGET_URL, env.BROWSER);
      await sendToDiscord(env, screenshot);
      console.log('Screenshot capture and Discord posting completed successfully');
    } catch (error) {
      console.error('Error in scheduled job:', error);
      await sendErrorToDiscord(env, error as Error);
    }
  },
};

/**
 * Capture screenshot using Cloudflare Browser Rendering (Playwright)
 */
async function captureScreenshot(url: string, browser: BrowserWorker, retries = 3): Promise<Blob> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Screenshot attempt ${attempt}/${retries} for URL: ${url}`);
      
      // Launch browser using Cloudflare Browser Rendering (Playwright)
      const browserInstance = await launch(browser);
      
      try {
        const page = await browserInstance.newPage();
        
        // Set viewport to desired screenshot size
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // Navigate to target URL
        await page.goto(url, { 
          waitUntil: 'load',
          timeout: 30000 
        });
        
        // Scroll through page to trigger lazy loading
        await autoScroll(page);
        
        // Wait for images to load (with timeout)
        try {
          await page.waitForFunction('window.allImagesLoaded === true', { timeout: 5000 });
        } catch {
          console.log('allImagesLoaded not found or timeout, continuing...');
        }
        
        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: true  // 📸 Full page screenshot including all scrollable content
        });
        
        // Convert buffer to blob (Playwright returns Buffer)
        const blob = new Blob([screenshot], { type: 'image/png' });
        
        console.log(`Screenshot captured successfully (${blob.size} bytes)`);
        return blob;
        
      } finally {
        // Always close the browser
        await browserInstance.close();
      }
      
    } catch (error) {
      console.error(`Screenshot attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error(`Failed to capture screenshot after ${retries} attempts: ${(error as Error).message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  throw new Error('Unexpected error in screenshot capture');
}

/**
 * Send screenshot to Discord channel
 */
async function sendToDiscord(env: Environment, screenshot: Blob, retries = 3): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Discord posting attempt ${attempt}/${retries}`);
      
      const formData = new FormData();
      formData.append('file', screenshot, 'screenshot.png');

      const response = await fetch(`https://discord.com/api/v10/channels/${env.DISCORD_CHANNEL_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('Screenshot posted to Discord successfully');
      return;
    } catch (error) {
      console.error(`Discord posting attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error(`Failed to post to Discord after ${retries} attempts: ${(error as Error).message}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Send error notification to Discord
 */
async function sendErrorToDiscord(env: Environment, error: Error): Promise<void> {
  try {
    const errorMessage = {
      content: `🚨 **Screenshot Capture Error**\n\`\`\`\n${error.message}\n\`\`\`\nTime: ${new Date().toISOString()}`,
    };

    const response = await fetch(`https://discord.com/api/v10/channels/${env.DISCORD_CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorMessage),
    });

    if (!response.ok) {
      console.error('Failed to send error notification to Discord:', response.status, response.statusText);
    } else {
      console.log('Error notification sent to Discord');
    }
  } catch (notificationError) {
    console.error('Failed to send error notification:', notificationError);
  }
}

async function autoScroll(page: Page): Promise<void> {
  // Get page height (minimal evaluate usage)
  const scrollHeight = await page.evaluate('document.body.scrollHeight') as number;
  
  // Scroll down in steps using keyboard navigation
  const steps = Math.ceil(scrollHeight / 500); // Adjust step size for PageDown
  
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('PageDown');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Scroll back to top
  await page.keyboard.press('Home');
  await new Promise(resolve => setTimeout(resolve, 200));
}
