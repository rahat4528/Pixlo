export interface MergeResult {
  hasConflict: boolean;
  mergedText: string;
  conflictCopyRequired: boolean;
  conflictCopyTitle?: string;
  conflictCopyContent?: string;
}

export class ConflictResolver {
  /**
   * Performs a 3-way line-based merge between base, local, and remote versions.
   * - If changes do not overlap on the same lines, merges automatically.
   * - If overlapping edits occur, generates an explicit conflict copy so nothing is lost.
   */
  static threeWayMerge(
    baseText: string,
    localText: string,
    remoteText: string,
    noteTitle: string = 'Untitled Note',
  ): MergeResult {
    // Trivial case 1: Local has not changed
    if (localText === baseText) {
      return {
        hasConflict: false,
        mergedText: remoteText,
        conflictCopyRequired: false,
      };
    }

    // Trivial case 2: Remote has not changed or both made identical edits
    if (remoteText === baseText || localText === remoteText) {
      return {
        hasConflict: false,
        mergedText: localText,
        conflictCopyRequired: false,
      };
    }

    const baseLines = baseText.split('\n');
    const localLines = localText.split('\n');
    const remoteLines = remoteText.split('\n');

    const mergedLines: string[] = [];
    let hasConflict = false;

    // Check if one side only appended lines to the end
    if (
      localText.startsWith(baseText) &&
      remoteText.startsWith(baseText) &&
      baseText.length > 0
    ) {
      const localAppend = localText.slice(baseText.length);
      const remoteAppend = remoteText.slice(baseText.length);
      return {
        hasConflict: false,
        mergedText: `${baseText}${remoteAppend}\n${localAppend.trim()}`,
        conflictCopyRequired: false,
      };
    }

    // Line-by-line diff examination
    const maxLen = Math.max(baseLines.length, localLines.length, remoteLines.length);

    for (let i = 0; i < maxLen; i++) {
      const baseLine = baseLines[i];
      const localLine = localLines[i];
      const remoteLine = remoteLines[i];

      if (localLine === remoteLine) {
        if (localLine !== undefined) mergedLines.push(localLine);
      } else if (localLine === baseLine) {
        // Only remote changed this line
        if (remoteLine !== undefined) mergedLines.push(remoteLine);
      } else if (remoteLine === baseLine) {
        // Only local changed this line
        if (localLine !== undefined) mergedLines.push(localLine);
      } else {
        // Both sides changed the same line differently -> Overlap Conflict!
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      return {
        hasConflict: false,
        mergedText: mergedLines.join('\n'),
        conflictCopyRequired: false,
      };
    }

    // Overlapping conflict: Keep remote as server canonical, fork local as conflict copy
    return {
      hasConflict: true,
      mergedText: remoteText,
      conflictCopyRequired: true,
      conflictCopyTitle: `[Conflict Copy] ${noteTitle}`,
      conflictCopyContent: localText,
    };
  }

  /**
   * Generates conflict copy naming with timestamp
   */
  static generateConflictTitle(originalTitle: string): string {
    const timeStr = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return `[Conflict Copy - ${timeStr}] ${originalTitle}`;
  }
}
