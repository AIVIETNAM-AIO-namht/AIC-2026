---
name: Clarity & Dignity Inclusive Interviewing
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3d4947'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#a33900'
  on-tertiary: '#ffffff'
  tertiary-container: '#cc4900'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  caption-stream:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system is tailored for HR teams, hiring managers, and candidate-facing assistive surfaces during live interviews involving Deaf and Hard-of-Hearing (DHH) candidates. The core brand philosophy rejects the clinical, sterile aesthetic of disability accommodation software in favor of an empowering, modern workspace tool that signals equity, composure, and mutual respect.

The visual style blends **Modern Minimalism** with **Warm Tactile Humanity**:
- **Tone & Mood:** Reassuring, unhurried, razor-sharp in clarity, and deeply empathetic. It eliminates cognitive fatigue through high-legibility visual hierarchies and open breathing room.
- **Visual Weight:** Deliberate spatial composition prioritizing live transcription views, visual turn-taking indicators, assistive cueing overlays, and real-time caption flows without visual clutter or distraction.
- **Accessibility Posture:** Built strictly to exceed WCAG 2.2 Level AAA standards for contrast, focus discoverability, and visual cues, ensuring non-auditory notifications carry unambiguous semantic presence.

## Colors

The color palette centers on grounding deep teals, energetic yet warm coral accents, and rich, non-glare slate neutrals. It purposefully avoids harsh pure-black on pure-white contrasts to prevent eye strain during sustained reading of live transcription feeds.

- **Primary Teal (`#0D9488` / `#0F766E`):** Represents calm authority, focus, and structural navigation. Used for headers, active interface states, verified badges, and interactive navigation tabs.
- **Warm Coral Accent (`#EA580C`):** Reserved strictly for primary intent actions (e.g., "Start Live Transcription", "Admit Candidate", "Pin Video/Interpreter") and urgent non-auditory visual alerts (e.g., sound-detected banners, hands-raised, turn alerts).
- **Secondary Cyan Tints (`#F0FDFA`, `#CCFBF1`):** Applied as tinted backdrop layers behind real-time speech-to-text streams and automated caption boxes, creating clear semantic separation from interview notes.
- **Neutrals & Surfaces (`#1E293B`, `#F8FAFC`, `#FFFFFF`):** High-contrast dark slate (`#1E293B`) text against soft paper-warm surfaces (`#F8FAFC`) delivers optimal optical clarity without blinding luminescence.
- **Semantic Feedback:**
  - *Active Speaking / Sound Cue:* Soft Amber/Orange ring (`#F59E0B`)
  - *Real-time Sign/Caption Sync:* Vibrant Emerald (`#059669`)
  - *Focus Indicator:* Dual-ring offset with `#0D9488` and pure white.

## Typography

The type system blends the welcoming, human geometry of **Plus Jakarta Sans** for structural elements and navigation with the superior letterform distinction of **Atkinson Hyperlegible Next** for continuous reading, transcripts, and operational guidance.

- **Legibility for Rapid Scanning:** Atkinson Hyperlegible Next guarantees unambiguous character recognition (such as distinguishing `I`, `l`, `1` or `0`, `O`), which is vital during real-time captions and high-stakes interview evaluations.
- **Caption Stream Role (`caption-stream`):** Set at a generous 22px baseline with 34px line height to allow smooth peripheral reading without pulling concentration entirely away from facial cues, lips, and sign language interpreters.
- **Hierarchical Sizing:** Mobile variants scale down major display headers to maintain comfortable vertical real estate for video tiles and assistive transcription sidecars.

## Layout & Spacing

This design system uses a responsive **Fluid Grid** framework structured to accommodate simultaneous multi-modal streams (video feed, real-time transcription, evaluation criteria, and interpreter pinning).

- **Desktop Layout (1200px+):** A 12-column dynamic grid with a default split: 8 columns reserved for video feeds and dynamic transcription overlays; 4 columns dedicated to assistive copilot insights, suggested accommodations, and rubric notes.
- **Tablet Layout (768px - 1199px):** 8-column layout. Transcription docks to a permanent bottom panel occupying 35% of the viewport height, ensuring video feeds maintain 1:1 visibility without obstruction.
- **Mobile Handheld (<768px):** 4-column layout where video and captions remain vertically stacked, and HR copilot guidance tucks into an accessible swipe-up bottom sheet.
- **Whitespace Principles:** Generous padding (`space-md`, `space-lg`) wraps text blocks to prevent claustrophobic density, directly lowering the visual stress of neurodivergent, DHH, and multilingual participants.

## Elevation & Depth

To maintain high visual acuity and eliminate blurry optical distractions, depth is articulated through **Tonal Layers** combined with **Low-Contrast Crisp Outlines**, rather than muddy dropped shadows.

- **Base Canvas:** `#F8FAFC` provides a calm backdrop.
- **Surface Level 1 (Cards, Modules):** Pure white (`#FFFFFF`) with a 1px solid border (`#E2E8F0`).
- **Surface Level 2 (Active Transcripts, Interpreter Dock):** `#F0FDFA` paired with a teal-tinted boundary (`#99F6E4`) to immediately signal active transcription status.
- **Floating Overlays & Modals:** Minimal ambient elevation using an extra-diffused, cool-tinted shadow (`box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.06)`).
- **Focus States:** Never rely solely on color. Interactive focus states utilize a crisp 3px outline in `#0D9488` with a 2px offset white gap, preventing clipping in dark or dense layouts.

## Shapes

The design system incorporates **Roundedness Level 2** (0.5rem base radius) to evoke a friendly, respectful, and contemporary environment that dissolves corporate stiffness without feeling childlike.

- **Inputs, Buttons, and Chips:** Set to `rounded` (0.5rem / 8px) for comfortable touch targets and clear boundaries.
- **Panels, Video Containers, and Content Cards:** Set to `rounded-lg` (1rem / 16px) to soften the interview framing and keep focus directed inward.
- **Assistive Floating Alerts & Visual Turn Badges:** Set to `rounded-xl` (1.5rem / 24px) to signal assistive utility apart from static layouts.

## Components

### Buttons
- **Primary Action (Coral):** Solid `#EA580C` background, `#FFFFFF` text, `label-lg` typography. 0.5rem radius, padding `0.875rem 1.75rem`. Hover: `#C2410C`. Active: scales down to 0.98. Focus: 3px `#0D9488` ring offset by 2px.
- **Secondary Action (Teal Outline):** 2px border `#0D9488`, transparent background, text `#0F766E`. Hover: `#F0FDFA`.
- **Assistive Mute/Visual Toggle:** Neutral light background (`#F1F5F9`), text `#1E293B`, paired with clear textual and icon cues indicating state (e.g., "Captions: ON", never icon-only).

### Live Captioning Stream Container
- High-contrast background (`#0F172A` in high-contrast mode, or `#FFFFFF` in standard mode) with a distinct 2px left accent line in `#0D9488`.
- Accommodates font resizers (`A- / A+`) natively within the top bar.
- Speaker avatars are accompanied by both their full name and role in bold `label-sm` pills before the text node.

### Non-Auditory Notification Chips
- Height 36px, `label-md` font weight, radius `1rem`.
- Features an icon on the left (e.g., soundwave, raised hand, smile/reaction) with full text counterpart ("Interviewer speaking", "Candidate raised hand").
- Includes a subtle pulsing border (`#EA580C`) when alerting turn-taking events.

### Input Fields & Search Bars
- Background `#FFFFFF`, 1.5px border `#CBD5E1`, text `body-md` in `#1E293B`.
- 48px standard height to ensure accessible touch targets across all touch screens.
- Persistent visible floating labels—never relying on disappearing placeholders alone.

### Cards & Interview Rubric Modules
- Pure white surface, 1px border `#E2E8F0`, interior padding of `space-md` or `space-lg`.
- Clear semantic segmentation between question prompts, assistive tips (e.g., "Allow visual pause for interpreter lag"), and rating sliders.

### Turn-Taking Status Indicators
- Docked indicator showing real-time acoustic/visual room status: "Channel Clear", "Candidate Speaking", or "Interpreter Active" with distinctive color-coded and geometric icons to support color-blind participants.