export const EPISODES = [
  {
    id: "ep45",
    title: "Episode 45 – Ball Handling Basics",
    host: "Coach Adams",
    type: "Video",
    date: "Jul 28, 2026",
    plays: "18.2k",
    completion: 84,
    status: "Published",
    duration: "22 min",
    description:
      "A breakdown of core ball handling fundamentals — dribbling under pressure, change of pace, and protecting the rock against aggressive defenders.",
  },
  {
    id: "ep44",
    title: "Episode 44 – Defense Wins Games",
    host: "Coach Marcus",
    type: "Audio",
    date: "Jul 21, 2026",
    plays: "12.4k",
    completion: 71,
    status: "Published",
    duration: "18 min",
    description:
      "Coach Marcus walks through defensive stance, sliding mechanics, and how to read offensive tendencies to stay a step ahead.",
  },
  {
    id: "ep43",
    title: "Episode 43 – Shooting Mechanics",
    host: "Coach Rivera",
    type: "Video",
    date: "Jul 14, 2026",
    plays: "15.8k",
    completion: 63,
    status: "Published",
    duration: "25 min",
    description:
      "Coach Rivera breaks down the perfect shooting motion — footwork, release point, and follow-through for a more consistent jumper.",
  },
  {
    id: "ep42",
    title: "Episode 42 – Recovery & Mobility",
    host: "Coach Lee",
    type: "Audio",
    date: "Jul 7, 2026",
    plays: "9.1k",
    completion: 55,
    status: "Published",
    duration: "20 min",
    description:
      "Practical recovery routines and mobility drills to keep players fresh and injury-free through a long season.",
  },
  {
    id: "ep41",
    title: "Episode 41 – Transition Offense",
    host: "Coach Adams",
    type: "Video",
    date: "Jun 30, 2026",
    plays: "11.3k",
    completion: 46,
    status: "Scheduled",
    duration: "19 min",
    description:
      "How to push the pace and create easy looks in transition before the defense can get set.",
  },
  {
    id: "ep40",
    title: "Episode 40 – Strength Training",
    host: "Coach Marcus",
    type: "Audio",
    date: "Jun 23, 2026",
    plays: "7.6k",
    completion: 49,
    status: "Scheduled",
    duration: "24 min",
    description:
      "A gym session focused on basketball-specific strength and power development for in-season athletes.",
  },
  {
    id: "ep39",
    title: "Episode 39 – Film Breakdown",
    host: "Coach Rivera",
    type: "Video",
    date: "Jun 16, 2026",
    plays: "13.9k",
    completion: 92,
    status: "Published",
    duration: "27 min",
    description:
      "Slow-motion breakdown of professional film, highlighting spacing, cuts, and split-second decision-making.",
  },
  {
    id: "ep38",
    title: "Episode 38 – Mental Game",
    host: "Coach Lee",
    type: "Audio",
    date: "Jun 9, 2026",
    plays: "8.4k",
    completion: 38,
    status: "Scheduled",
    duration: "16 min",
    description:
      "Strategies for staying locked in, handling pressure moments, and building a winning mindset.",
  },
];

export const PODCAST_HEADERS = [
  "Episode",
  "Host",
  "Type",
  "Date",
  "Plays",
  "Completion",
  "Status",
  "Action",
];

export function getEpisodeById(id) {
  try {
    const saved = JSON.parse(localStorage.getItem("podcastEpisodes") || "null");
    if (Array.isArray(saved)) {
      return saved.find((ep) => ep.id === id) || null;
    }
  } catch {}
  return EPISODES.find((ep) => ep.id === id) || null;
}
