/**
 * Utility functions for text wrapping and intelligent label splitting
 */

/**
 * Split a label intelligently based on separator characters and available width
 * 
 * @param text The original text to split
 * @param availableWidth Width available for rendering in pixels
 * @param fontSize Font size in pixels
 * @param maxLines Maximum number of lines to split text into
 * @returns An array of lines after splitting
 */

function splitWord(word: string){

}

export function intelligentTextSplit(
    text: string,
    availableWidth: number,
    fontSize: number = 12,
    maxLines: number = 3
  ): { lines: string[], isTruncated: boolean } {
    // Approximate characters that fit in the available width
    // Assume average character width is ~0.6x font size
    const approxCharsPerLine = Math.max(1, Math.floor(availableWidth / (fontSize * 0.6)));
    
    // If we can fit the whole text in one line, return it
    if (text.length <= approxCharsPerLine) {
      return { lines: [text], isTruncated: false };
    }
    
    // Try splitting by common separators
    const separators = ['_', '-', '.', '/', '\\'];
    let usedSeparator = '';
    let parts: string[] = [text];
    
    // Try each separator to see if we should split by it
    for (const separator of separators) {
      if (text.includes(separator)) {
        parts = text.split(separator);
        usedSeparator = separator;
        break;
      }
    }
    
    // Combine parts into lines that fit within approxCharsPerLine
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < parts.length && lines.length < maxLines; i++) {
      const part = parts[i];
      
      // If this is not the first part, add the separator back
      const prefix = i > 0 ? usedSeparator : '';
      // Check if adding this part would exceed the line length
      if ((currentLine + prefix + part).length <= approxCharsPerLine) {
        currentLine += prefix + part;
      } else {
        // Start a new line if current line has content
        if (currentLine.length > 0 && lines.length < maxLines) {
            lines.push(
                currentLine.substring(0, approxCharsPerLine)
            )
            let remainingPart = currentLine.substring(approxCharsPerLine);
            while(remainingPart.length > 0 && lines.length < maxLines) {
                
                currentLine = remainingPart.substring(0, approxCharsPerLine);
                lines.push(currentLine);
                remainingPart = remainingPart.substring(approxCharsPerLine);
                
            }
            currentLine = prefix + part;
        } else {
          // If the part itself is too long, we need to force-break it
          // Try to fit as much as possible
          currentLine = (prefix + part).substring(0, approxCharsPerLine);
          
          lines.push(currentLine);
          
          // Continue with the rest of the part
          let remainingPart = part.substring(approxCharsPerLine);
          while (remainingPart.length > 0) {
            if (lines.length >= maxLines - 1) {
              // We're at the max lines limit, save what we can
              break;
            }
            
            currentLine = remainingPart.substring(0, approxCharsPerLine);
            lines.push(currentLine);
            remainingPart = remainingPart.substring(approxCharsPerLine);
          }
          
          // Reset for the next part
          currentLine = '';
        }
      }
      
      // If we've reached the maximum number of lines, stop
      if (lines.length >= maxLines && i < parts.length - 1) {
        return { lines, isTruncated: true };
      }
    }
    
    // Add the last line if there's content
    if (currentLine.length > 0) {
      if (lines.length < maxLines) {
        lines.push(currentLine);
      } else {
        // We've hit the max lines, this is truncated
        // return { lines, isTruncated: true };
      }
    }
    
    // If the entire text couldn't fit in the allowed lines
    const totalChars = lines.reduce((sum, line) => sum + line.length, 0);
    const isTruncated = totalChars < text.length;
    
    // For the last line, add ellipsis if truncated
    if (isTruncated && lines.length > 0) {
      const lastIndex = lines.length - 1;
      // Ensure we have room for ellipsis
      if (lines[lastIndex].length > 3) {
        lines[lastIndex] = lines[lastIndex].substring(0, lines[lastIndex].length - 3) + '...';
      } else {
        lines[lastIndex] += '...';
      }
    }
    
    return { lines, isTruncated };
  }
  
  /**
   * Determine if text should be displayed based on available width
   * 
   * @param availableWidth Width available for rendering
   * @param fontSize Font size in pixels
   * @param minCharsPerLine Minimum characters needed to make display worthwhile
   * @param maxLines Maximum number of lines to consider
   * @returns Boolean indicating if text should be displayed
   */
  export function shouldDisplayText(
    availableWidth: number,
    fontSize: number = 12,
    minCharsPerLine: number = 3,
    maxLines: number = 3
  ): boolean {
    // Approximate characters that would fit
    const approxCharsPerLine = Math.floor(availableWidth / (fontSize * 0.6));
    
    // Don't display text if we can't fit at least minCharsPerLine per line
    return approxCharsPerLine >= minCharsPerLine;
  }
  
  /**
   * Calculate the vertical position offset for centered multi-line text
   * 
   * @param lineCount Number of text lines
   * @param lineHeight Line height in pixels
   * @returns Vertical position offset in pixels
   */
  export function getMultiLineTextOffset(lineCount: number, lineHeight: number = 14): number {
    return ((lineCount - 1) * lineHeight) / 2;
  }