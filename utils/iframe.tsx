import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Extracts iframe tags from HTML content and splits the content into text segments and iframe elements
 * @param content HTML content that may contain iframe tags
 * @returns Object containing arrays of iframe tags and text segments
 */
export function extractIframes(content: string): {
  iframes: string[];
  textSegments: string[];
} {
  const iframeRegex = /<iframe[^>]*>[\s\S]*?<\/iframe>/gi;
  const textSegments: string[] = [];
  const iframes: string[] = [];

  let lastIndex = 0;
  let match;

  while ((match = iframeRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index).trim();
    if (textBefore) textSegments.push(textBefore);

    iframes.push(match[0]);

    lastIndex = match.index + match[0].length;
  }

  const textAfter = content.substring(lastIndex).trim();
  if (textAfter) textSegments.push(textAfter);

  if (iframes.length === 0) {
    textSegments.push(content);
  }

  return { iframes, textSegments };
}

/**
 * Creates a React Native WebView component from an iframe HTML string
 * @param iframeHtml HTML iframe string
 * @param isTablet Boolean indicating if the device is a tablet
 * @returns React Native component that renders the iframe content
 */
export function createWebViewFromIframe(
  iframeHtml: string,
  isTablet: boolean = false
): React.ReactElement {
  const srcMatch = iframeHtml.match(/src=["'](.*?)["']/i);
  const src = srcMatch ? srcMatch[1] : "";

  // Extract width and height from iframe attributes
  const widthAttrMatch = iframeHtml.match(/width=["'](.*?)["']/i);
  const heightAttrMatch = iframeHtml.match(/height=["'](.*?)["']/i);

  const numWidth = widthAttrMatch ? parseInt(widthAttrMatch[1], 10) : NaN;
  const numHeight = heightAttrMatch ? parseInt(heightAttrMatch[1], 10) : NaN;

  // Calculate aspect ratio
  let aspectRatio = 4/3; // Default aspect ratio
  if (!isNaN(numWidth) && !isNaN(numHeight) && numHeight > 0) {
    aspectRatio = numWidth / numHeight;
  }

  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = isTablet ? 600 : screenWidth - 32; // 16px padding on each side
  
  // Calculate height based on width and aspect ratio
  const height = maxWidth / aspectRatio;

  return (
    <View style={styles.container}>
      <View style={[
        styles.webViewContainer,
        { 
          width: maxWidth,
          height: height,
        }
      ]}>
        <WebView
          source={{ uri: src }}
          style={styles.webView}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          originWhitelist={['*']}
        />
      </View>
    </View>
  );
}

/**
 * Renders iframe content embedded in text
 * @param content HTML content that may contain iframe tags
 * @param isTablet Boolean indicating if the device is a tablet
 * @returns Array of React elements (text and WebViews)
 */
export function renderContentWithIframes(
  content: string,
  isTablet: boolean = false
): React.ReactNode[] {
  const { iframes, textSegments } = extractIframes(content);
  
  // If no iframes, return just the text
  if (iframes.length === 0) {
    return [content];
  }

  // Create array of components
  const components: React.ReactNode[] = [];
  
  // Add text segments and iframes in the correct order
  if (textSegments.length > iframes.length) {
    // More text segments than iframes
    for (let i = 0; i < textSegments.length; i++) {
      if (textSegments[i]) {
        components.push(
          <React.Fragment key={`text-${i}`}>
            {textSegments[i]}
          </React.Fragment>
        );
      }
      
      if (i < iframes.length) {
        components.push(
          <React.Fragment key={`iframe-${i}`}>
            {createWebViewFromIframe(iframes[i], isTablet)}
          </React.Fragment>
        );
      }
    }
  } else {
    // Equal or more iframes than text segments
    for (let i = 0; i < iframes.length; i++) {
      if (i < textSegments.length && textSegments[i]) {
        components.push(
          <React.Fragment key={`text-${i}`}>
            {textSegments[i]}
          </React.Fragment>
        );
      }
      
      components.push(
        <React.Fragment key={`iframe-${i}`}>
          {createWebViewFromIframe(iframes[i], isTablet)}
        </React.Fragment>
      );
    }
    
    // Add any remaining text
    if (textSegments.length > 0 && textSegments[textSegments.length - 1]) {
      components.push(
        <React.Fragment key={`text-last`}>
          {textSegments[textSegments.length - 1]}
        </React.Fragment>
      );
    }
  }
  
  return components;
}

/**
 * Detect if the current device is a tablet based on screen dimensions
 * @returns Boolean indicating if the device is a tablet
 */
export function isTablet(): boolean {
  const { width, height } = Dimensions.get('window');
  const screenSize = Math.sqrt(width * width + height * height) / 160; // diagonal size in inches
  return screenSize >= 7; // Generally tablets have 7+ inch screens
}

// Styles for the WebView components
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
  },
  webViewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  webView: {
    flex: 1,
  }
});

// Helper function to create HTML content for WebView when direct URL is not available
export function createHtmlContentForWebView(iframeHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
          iframe { border: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        ${iframeHtml}
      </body>
    </html>
  `;
}

