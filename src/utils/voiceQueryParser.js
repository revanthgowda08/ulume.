const SYNONYMS = {
  "ಯೂರಿಯಾ": "urea",
  "ಡಿಎಪಿ": "dap",
  "ಗೊಬ್ಬರ": "fertilizer",
  "ಬೀಜ": "seeds",
  "ಭತ್ತ": "paddy",
  "ಕಬ್ಬು": "sugarcane",
  "ನೀರಾವರಿ": "irrigation",
  "ಕೀಟನಾಶಕ": "pesticide",
  "ಉಪಕರಣ": "tools",
  "ಸ್ಪ್ರೇಯರ್": "sprayer",
  "ಪಂಪ್": "pump",
  "ಪೊಟ್ಯಾಶ್": "potash",
  "यूरिया": "urea",
  "खाद": "fertilizer",
  "बीज": "seeds",
  "DAP": "dap",
  "urea": "urea",
};

export const parseVoiceQuery = (transcript) => {
  const lower = transcript.toLowerCase();
  const found = new Set();
  for (const [key, val] of Object.entries(SYNONYMS)) {
    if (lower.includes(key.toLowerCase())) found.add(val);
  }
  if (found.size === 0) lower.split(/\s+/).forEach((w) => w.length > 2 && found.add(w));
  return [...found];
};
