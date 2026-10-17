/** A point on a section photo, as fractions of its width and height (0–1). */
export type Point = [number, number];

export interface ImageFile {
  /** Pixel width of this file. */
  w: number;
  /** Path relative to the asset base. */
  src: string;
}

export interface SectionImage {
  /** Full-resolution pixel size; hotspot geometry is relative to this. */
  width: number;
  height: number;
  /** Same photo at increasing widths; the wall loads only what the zoom level needs. */
  files: ImageFile[];
  /** Tiny blurred data URL shown while the first file loads. */
  placeholder: string;
  /** Full-resolution tiles, for images wider than the largest whole file. Loaded only when zoomed in. */
  tiles?: {
    size: number;
    cols: number;
    rows: number;
    /** Path template with {col} and {row}. Each tile is size+1 px so neighbours overlap by a pixel. */
    src: string;
  };
}

/** Where one frame sits on one section photo. A frame can appear on several sections. */
export interface Hotspot {
  frame: string;
  /** Outline in order. Four points are treated as corners (TL, TR, BR, BL) for the straightened view. */
  points: Point[];
}

export interface Section {
  id: string;
  title: string;
  image: SectionImage;
  hotspots: Hotspot[];
}

/** What happens when a visitor opens a frame. */
export type FrameAction =
  | { type: 'ask' }
  | { type: 'link'; href: string; label?: string }
  | { type: 'story'; href: string; label?: string }
  | { type: 'easter-egg'; href?: string; message?: string };

/** Content for one physical frame. Everything but `id` is optional; unknown frames default to "ask". */
export interface Frame {
  id: string;
  /** The number on the frame's tag on the real wall, if readable. */
  tag?: string;
  title?: string;
  /** Short line shown on hover. */
  teaser?: string;
  description?: string;
  /** Straight-on close-up photo (path relative to the asset base). Falls back to the wall crop. */
  closeup?: string;
  action?: FrameAction;
  related?: string[];
  themes?: string[];
  /** Internal notes for whoever maintains the data. Never shown to visitors. */
  notes?: string;
}

export interface Submission {
  frameId: string;
  sectionId: string;
  text: string;
  name?: string;
  contact?: string;
}

export interface SubmissionAdapter {
  submit(submission: Submission): Promise<void>;
}
