import { SlideItem, SongMetadata, SongPackage } from '../types/lyrics';

/**
 * Song 1: You Laid Aside Your Majesty (Noel Richards)
 */
export const song1Meta: SongMetadata = {
  id: 'you-laid-aside-your-majesty',
  title: 'You Laid Aside Your Majesty',
  artist: 'Noel Richards',
  originalKey: 'G Major',
  tempoBpm: 68,
  totalDuration: 240, // 4 minutes
};

export const song1Slides: SlideItem[] = [
  {
    id: 'slide-0',
    section: 'intro',
    sectionLabel: 'Intro',
    startTime: 0,
    endTime: 12,
    lines: [
      { id: 'l0-1', text: 'You Laid Aside Your Majesty', startTime: 0, endTime: 6 },
      { id: 'l0-2', text: '(I Really Want to Worship You)', startTime: 6, endTime: 12 },
    ],
    notes: 'Acoustic piano intro in G',
  },
  {
    id: 'slide-1',
    section: 'verse',
    sectionLabel: 'Verse 1 - Part 1',
    startTime: 12,
    endTime: 25,
    lines: [
      { id: 'l1-1', text: 'You laid aside, Your majesty', startTime: 12, endTime: 16.5 },
      { id: 'l1-2', text: 'Gave up everything for me', startTime: 16.5, endTime: 20.5 },
      { id: 'l1-3', text: 'Suffered at the hands of those You had created', startTime: 20.5, endTime: 25 },
    ],
  },
  {
    id: 'slide-2',
    section: 'verse',
    sectionLabel: 'Verse 1 - Part 2',
    startTime: 25,
    endTime: 39,
    lines: [
      { id: 'l2-1', text: 'You took all my guilt and shame', startTime: 25, endTime: 29.5 },
      { id: 'l2-2', text: 'When You died and rose again', startTime: 29.5, endTime: 33.5 },
      { id: 'l2-3', text: 'Now today You reign', startTime: 33.5, endTime: 36 },
      { id: 'l2-4', text: 'In heaven and earth exalted', startTime: 36, endTime: 39 },
    ],
  },
  {
    id: 'slide-3',
    section: 'chorus',
    sectionLabel: 'Chorus 1 - Part 1',
    startTime: 39,
    endTime: 53,
    lines: [
      { id: 'l3-1', text: 'I really want to worship You, my Lord', startTime: 39, endTime: 44 },
      { id: 'l3-2', text: 'You have won my heart and I am Yours', startTime: 44, endTime: 48.5 },
      { id: 'l3-3', text: 'Forever and ever, I will love You', startTime: 48.5, endTime: 53 },
    ],
  },
  {
    id: 'slide-4',
    section: 'chorus',
    sectionLabel: 'Chorus 1 - Part 2',
    startTime: 53,
    endTime: 68,
    lines: [
      { id: 'l4-1', text: 'You are the only one who died for me', startTime: 53, endTime: 58 },
      { id: 'l4-2', text: 'Gave Your life to set me free', startTime: 58, endTime: 62.5 },
      { id: 'l4-3', text: 'So I lift my voice to You in adoration', startTime: 62.5, endTime: 68 },
    ],
  },
  {
    id: 'slide-5',
    section: 'verse',
    sectionLabel: 'Verse 2 - Part 1',
    startTime: 68,
    endTime: 81,
    lines: [
      { id: 'l5-1', text: 'You laid aside, Your majesty', startTime: 68, endTime: 72.5 },
      { id: 'l5-2', text: 'Gave up everything for me', startTime: 72.5, endTime: 76.5 },
      { id: 'l5-3', text: 'Suffered at the hands of those You had created', startTime: 76.5, endTime: 81 },
    ],
  },
  {
    id: 'slide-6',
    section: 'verse',
    sectionLabel: 'Verse 2 - Part 2',
    startTime: 81,
    endTime: 95,
    lines: [
      { id: 'l6-1', text: 'You took all my guilt and shame', startTime: 81, endTime: 85.5 },
      { id: 'l6-2', text: 'When You died and rose again', startTime: 85.5, endTime: 89.5 },
      { id: 'l6-3', text: 'Now today You reign', startTime: 89.5, endTime: 92 },
      { id: 'l6-4', text: 'In heaven and earth exalted', startTime: 92, endTime: 95 },
    ],
  },
  {
    id: 'slide-7',
    section: 'chorus',
    sectionLabel: 'Chorus 2 - Part 1',
    startTime: 95,
    endTime: 109,
    lines: [
      { id: 'l7-1', text: 'I really want to worship You, my Lord', startTime: 95, endTime: 100 },
      { id: 'l7-2', text: 'You have won my heart, and I am Yours (I am Yours)', startTime: 100, endTime: 104.5 },
      { id: 'l7-3', text: 'Forever and ever, I will love You', startTime: 104.5, endTime: 109 },
    ],
  },
  {
    id: 'slide-8',
    section: 'chorus',
    sectionLabel: 'Chorus 2 - Part 2',
    startTime: 109,
    endTime: 124,
    lines: [
      { id: 'l8-1', text: 'You are the only one who died for me', startTime: 109, endTime: 114 },
      { id: 'l8-2', text: 'Gave Your life to set me free (set me free)', startTime: 114, endTime: 118.5 },
      { id: 'l8-3', text: 'So I lift my voice to You in adoration', startTime: 118.5, endTime: 124 },
    ],
  },
  {
    id: 'slide-9',
    section: 'bridge',
    sectionLabel: 'Bridge - Part 1',
    startTime: 125,
    endTime: 141,
    lines: [
      { id: 'l9-1', text: 'I really want to worship You', startTime: 125, endTime: 130 },
      { id: 'l9-2', text: '(I really want to worship You, yes I do)', startTime: 130, endTime: 135 },
      { id: 'l9-3', text: 'Forever and ever (ever and ever), I will love You', startTime: 135, endTime: 141 },
    ],
  },
  {
    id: 'slide-10',
    section: 'bridge',
    sectionLabel: 'Bridge - Adoration',
    startTime: 141,
    endTime: 157,
    lines: [
      { id: 'l10-1', text: 'You are the only one', startTime: 141, endTime: 145 },
      { id: 'l10-2', text: 'The only one who died for me', startTime: 145, endTime: 150 },
      { id: 'l10-3', text: 'So I lift my voice to You (lift it up to You) in adoration', startTime: 150, endTime: 157 },
    ],
  },
  {
    id: 'slide-11',
    section: 'vamp',
    sectionLabel: 'Vamp 2 - Forever and Ever',
    startTime: 157,
    endTime: 173,
    lines: [
      { id: 'l11-1', text: 'I really want to worship You', startTime: 157, endTime: 161 },
      { id: 'l11-2', text: '(Forever and ever, ever and ever, ever and ever)', startTime: 161, endTime: 167 },
      { id: 'l11-3', text: 'Forever and ever, I will love You', startTime: 167, endTime: 173 },
    ],
  },
  {
    id: 'slide-12',
    section: 'outro',
    sectionLabel: 'Outro - Part 1',
    startTime: 173,
    endTime: 189,
    lines: [
      { id: 'l12-1', text: 'I really want to worship You (oh yes, I do)', startTime: 173, endTime: 180 },
      { id: 'l12-2', text: 'So I lift my voice to You (lift it up to You) in adoration', startTime: 180, endTime: 189 },
    ],
  },
  {
    id: 'slide-13',
    section: 'outro',
    sectionLabel: 'Outro - Part 2',
    startTime: 189,
    endTime: 205,
    lines: [
      { id: 'l13-1', text: 'I really want to worship You (with all of my heart)', startTime: 189, endTime: 196.5 },
      { id: 'l13-2', text: 'Forever and ever (oh) I will love You', startTime: 196.5, endTime: 205 },
    ],
  },
  {
    id: 'slide-14',
    section: 'outro',
    sectionLabel: 'Climax & Finale',
    startTime: 205,
    endTime: 228,
    lines: [
      { id: 'l14-1', text: 'I really want to worship You (yes, I do)', startTime: 205, endTime: 210 },
      { id: 'l14-2', text: '(I wanna worship you) (worship you) (lift You on up, Lord)', startTime: 210, endTime: 216 },
      { id: 'l14-3', text: 'So I lift my voice to You (magnify Your name) in adoration (oh)', startTime: 216, endTime: 222 },
      { id: 'l14-4', text: 'I really want to worship You', startTime: 222, endTime: 228 },
    ],
  },
  {
    id: 'slide-15',
    section: 'instrumental',
    sectionLabel: 'Ending / Instrumental',
    startTime: 228,
    endTime: 240,
    lines: [
      { id: 'l15-1', text: '✦ In Adoration ✦', startTime: 228, endTime: 235 },
      { id: 'l15-2', text: 'Amen', startTime: 235, endTime: 240 },
    ],
    notes: 'Gentle piano sustain outro',
  },
];

/**
 * Song 2: God, You’re So Good (Kristian Stanfill & Passion ‧ 2018)
 */
export const song2Meta: SongMetadata = {
  id: 'god-youre-so-good',
  title: "God, You’re So Good",
  artist: 'Kristian Stanfill & Passion',
  year: '2018',
  originalKey: 'Bb Major',
  tempoBpm: 70,
  totalDuration: 280, // 4m 40s
};

export const song2Slides: SlideItem[] = [
  {
    id: 'slide-gysg-0',
    section: 'intro',
    sectionLabel: 'Intro',
    startTime: 0,
    endTime: 14,
    lines: [
      { id: 'gysg-0-1', text: "God, You’re So Good", startTime: 0, endTime: 7 },
      { id: 'gysg-0-2', text: 'Kristian Stanfill & Passion (2018)', startTime: 7, endTime: 14 },
    ],
    notes: 'Warm acoustic worship piano and ambient pads in Bb',
  },
  {
    id: 'slide-gysg-1',
    section: 'verse',
    sectionLabel: 'Verse 1 - Part 1',
    startTime: 14,
    endTime: 27,
    lines: [
      { id: 'gysg-1-1', text: 'Amazing love that welcomes me', startTime: 14, endTime: 20.5 },
      { id: 'gysg-1-2', text: 'The kindness of mercy', startTime: 20.5, endTime: 27 },
    ],
  },
  {
    id: 'slide-gysg-2',
    section: 'verse',
    sectionLabel: 'Verse 1 - Part 2',
    startTime: 27,
    endTime: 41,
    lines: [
      { id: 'gysg-2-1', text: 'That bought with blood, wholeheartedly', startTime: 27, endTime: 34 },
      { id: 'gysg-2-2', text: 'My soul undeserving', startTime: 34, endTime: 41 },
    ],
  },
  {
    id: 'slide-gysg-3',
    section: 'chorus',
    sectionLabel: 'Chorus 1',
    startTime: 41,
    endTime: 68,
    lines: [
      { id: 'gysg-3-1', text: "God, You’re so good", startTime: 41, endTime: 47.5 },
      { id: 'gysg-3-2', text: "God, You’re so good", startTime: 47.5, endTime: 54 },
      { id: 'gysg-3-3', text: "God, You’re so good", startTime: 54, endTime: 60.5 },
      { id: 'gysg-3-4', text: "You’re so good to me", startTime: 60.5, endTime: 68 },
    ],
  },
  {
    id: 'slide-gysg-4',
    section: 'verse',
    sectionLabel: 'Verse 2 - Part 1',
    startTime: 68,
    endTime: 82,
    lines: [
      { id: 'gysg-4-1', text: 'Behold the cross, age to age', startTime: 68, endTime: 75 },
      { id: 'gysg-4-2', text: 'And hour by hour', startTime: 75, endTime: 82 },
    ],
  },
  {
    id: 'slide-gysg-5',
    section: 'verse',
    sectionLabel: 'Verse 2 - Part 2',
    startTime: 82,
    endTime: 96,
    lines: [
      { id: 'gysg-5-1', text: 'The dead are raised, the sinner saved', startTime: 82, endTime: 89 },
      { id: 'gysg-5-2', text: 'The work of Your power', startTime: 89, endTime: 96 },
    ],
  },
  {
    id: 'slide-gysg-6',
    section: 'chorus',
    sectionLabel: 'Chorus 2',
    startTime: 96,
    endTime: 123,
    lines: [
      { id: 'gysg-6-1', text: "God, You’re so good", startTime: 96, endTime: 102.5 },
      { id: 'gysg-6-2', text: "God, You’re so good", startTime: 102.5, endTime: 109 },
      { id: 'gysg-6-3', text: "God, You’re so good", startTime: 109, endTime: 115.5 },
      { id: 'gysg-6-4', text: "You’re so good to me", startTime: 115.5, endTime: 123 },
    ],
  },
  {
    id: 'slide-gysg-7',
    section: 'bridge',
    sectionLabel: 'Bridge - Part 1',
    startTime: 123,
    endTime: 138,
    lines: [
      { id: 'gysg-7-1', text: 'I am blessed, I am called', startTime: 123, endTime: 128 },
      { id: 'gysg-7-2', text: 'I am healed, I am whole', startTime: 128, endTime: 133 },
      { id: 'gysg-7-3', text: 'I am saved in Jesus’ name', startTime: 133, endTime: 138 },
    ],
  },
  {
    id: 'slide-gysg-8',
    section: 'bridge',
    sectionLabel: 'Bridge - Part 2',
    startTime: 138,
    endTime: 152,
    lines: [
      { id: 'gysg-8-1', text: 'Highly favored, anointed', startTime: 138, endTime: 142.5 },
      { id: 'gysg-8-2', text: 'Filled with Your power', startTime: 142.5, endTime: 147 },
      { id: 'gysg-8-3', text: 'For the glory of Jesus’ name', startTime: 147, endTime: 152 },
    ],
  },
  {
    id: 'slide-gysg-9',
    section: 'chorus',
    sectionLabel: 'Chorus 3',
    startTime: 152,
    endTime: 179,
    lines: [
      { id: 'gysg-9-1', text: "God, You’re so good", startTime: 152, endTime: 158.5 },
      { id: 'gysg-9-2', text: "God, You’re so good", startTime: 158.5, endTime: 165 },
      { id: 'gysg-9-3', text: "God, You’re so good", startTime: 165, endTime: 171.5 },
      { id: 'gysg-9-4', text: "You’re so good to me", startTime: 171.5, endTime: 179 },
    ],
  },
  {
    id: 'slide-gysg-10',
    section: 'verse',
    sectionLabel: 'Verse 3 - Part 1',
    startTime: 179,
    endTime: 193,
    lines: [
      { id: 'gysg-10-1', text: 'And should this life bring suffering', startTime: 179, endTime: 186 },
      { id: 'gysg-10-2', text: 'Lord, I will remember', startTime: 186, endTime: 193 },
    ],
  },
  {
    id: 'slide-gysg-11',
    section: 'verse',
    sectionLabel: 'Verse 3 - Part 2',
    startTime: 193,
    endTime: 207,
    lines: [
      { id: 'gysg-11-1', text: 'What Calvary has bought for me', startTime: 193, endTime: 200 },
      { id: 'gysg-11-2', text: 'Both now and forever', startTime: 200, endTime: 207 },
    ],
  },
  {
    id: 'slide-gysg-12',
    section: 'bridge',
    sectionLabel: 'Bridge (Build) - Part 1',
    startTime: 207,
    endTime: 221,
    lines: [
      { id: 'gysg-12-1', text: 'I am blessed, I am called', startTime: 207, endTime: 211.5 },
      { id: 'gysg-12-2', text: 'I am healed, I am whole', startTime: 211.5, endTime: 216 },
      { id: 'gysg-12-3', text: 'I am saved in Jesus’ name', startTime: 216, endTime: 221 },
    ],
  },
  {
    id: 'slide-gysg-13',
    section: 'bridge',
    sectionLabel: 'Bridge (Build) - Part 2',
    startTime: 221,
    endTime: 235,
    lines: [
      { id: 'gysg-13-1', text: 'Highly favored, anointed', startTime: 221, endTime: 225.5 },
      { id: 'gysg-13-2', text: 'Filled with Your power', startTime: 225.5, endTime: 230 },
      { id: 'gysg-13-3', text: 'For the glory of Jesus’ name', startTime: 230, endTime: 235 },
    ],
  },
  {
    id: 'slide-gysg-14',
    section: 'chorus',
    sectionLabel: 'Chorus 4 (Climax)',
    startTime: 235,
    endTime: 262,
    lines: [
      { id: 'gysg-14-1', text: "God, You’re so good", startTime: 235, endTime: 241.5 },
      { id: 'gysg-14-2', text: "God, You’re so good", startTime: 241.5, endTime: 248 },
      { id: 'gysg-14-3', text: "God, You’re so good", startTime: 248, endTime: 254.5 },
      { id: 'gysg-14-4', text: "You’re so good to me", startTime: 254.5, endTime: 262 },
    ],
  },
  {
    id: 'slide-gysg-15',
    section: 'outro',
    sectionLabel: 'Outro',
    startTime: 262,
    endTime: 280,
    lines: [
      { id: 'gysg-15-1', text: "You’re so good to me", startTime: 262, endTime: 268 },
      { id: 'gysg-15-2', text: "You’re so good to me", startTime: 268, endTime: 274 },
      { id: 'gysg-15-3', text: "God, You’re so good", startTime: 274, endTime: 280 },
    ],
    notes: 'Gentle acoustic piano and pad outro fade in Bb',
  },
];

export const initialSongLibrary: SongPackage[] = [
  {
    id: song1Meta.id,
    meta: song1Meta,
    slides: song1Slides,
    themeId: 'theatrical-gold',
    notes: 'Classic worship anthem in G Major',
  },
  {
    id: song2Meta.id,
    meta: song2Meta,
    slides: song2Slides,
    themeId: 'emerald-grace',
    notes: 'Kristian Stanfill & Passion worship anthem in Bb Major (2018)',
  },
];
