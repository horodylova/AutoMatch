import { Categories, CategoryValue } from "./categories";

export type QuestionType =
  | "IconChoiceQuestion"
  | "PhotoQuestion"
  | "ChoiceQuestion"
  | "MultiChoiceQuestion"
  | "MultiPhotoQuestion"
  | "PhotoQuadQuestion"
  | "SliderQuestion"
  | "TableTagQuestion";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  tip?: string;
  minSelect?: number;
  maxSelect?: number;
}

export interface IconChoiceOption {
  key: string;
  title: string;
  desc: string;
  icon: string;
  categories?: {
    primary: CategoryValue;
    secondary: CategoryValue;
  };
}

export interface IconChoiceQuestionData extends BaseQuestion {
  type: "IconChoiceQuestion";
  options: IconChoiceOption[];
}

export interface PhotoOption {
  key: string;
  title: string;
  src: string;
  categories?: {
    primary: CategoryValue;
    secondary: CategoryValue;
  };
}

export interface PhotoQuestionData extends BaseQuestion {
  type: "PhotoQuestion";
  options: PhotoOption[];
}

export interface ChoiceOptionObj {
  label: string;
  mobileLabel?: string;
  categories?: {
    primary: CategoryValue;
    secondary: CategoryValue;
  };
}

export type ChoiceOption = string | ChoiceOptionObj;

export interface ChoiceQuestionData extends BaseQuestion {
  type: "ChoiceQuestion";
  options: ChoiceOption[];
}

export interface MultiChoiceQuestionData extends BaseQuestion {
  type: "MultiChoiceQuestion";
  options: ChoiceOption[];
  minSelect?: number;
}

export interface MultiPhotoQuestionData extends BaseQuestion {
  type: "MultiPhotoQuestion";
  options: PhotoOption[];
}

export interface PhotoQuadOption {
  label: string;
  categories?: {
    primary: CategoryValue;
    secondary: CategoryValue;
  };
}

export interface PhotoQuadQuestionData extends BaseQuestion {
  type: "PhotoQuadQuestion";
  options: PhotoQuadOption[] | string[];
  imageBasePath: string;
  mobileSuffix?: string;
}

export interface SliderRange {
  min: number;
  max: number;
  categories: {
    primary: CategoryValue;
    secondary: CategoryValue;
  };
}

export interface SliderQuestionData extends BaseQuestion {
  type: "SliderQuestion";
  min: number;
  max: number;
  step: number;
  labels: [string, string, string];
  categoryRanges: SliderRange[];
}

export interface TableTagQuestionData extends BaseQuestion {
  type: "TableTagQuestion";
  tags: TagOption[];
  minSelect?: number;
  maxSelect?: number;
}

export interface TagOptionObj {
  label: string;
  categories?: {
    primary: CategoryValue;
    secondary: CategoryValue;
  };
}

export type TagOption = string | TagOptionObj;

export type QuizQuestionData =
  | IconChoiceQuestionData
  | PhotoQuestionData
  | ChoiceQuestionData
  | MultiChoiceQuestionData
  | MultiPhotoQuestionData
  | PhotoQuadQuestionData
  | SliderQuestionData
  | TableTagQuestionData;

export const QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    id: "emotional_expectation",
    type: "IconChoiceQuestion",
    title: "What One Feeling Do You Want Your Car to Give You?",
    tip: "When you walk up to it and get in — what’s the dominant emotion?",
    options: [
      {
        key: "security_safety",
        title: "Security & Safety",
        desc: "I want to feel protected and shielded from the world",
        icon: "/commanding view icons/important.svg",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "freedom_possibility",
        title: "Freedom & Possibility",
        desc: "I want to feel like I can go anywhere at any time",
        icon: "/commanding view icons/helpful.svg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.ROAD_TRIP,
        },
      },
      {
        key: "status_achievement",
        title: "Status & Achievement",
        desc: "I want to feel proud of what I’ve earned and show it",
        icon: "/commanding view icons/not-important.svg",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        key: "joy_excitement",
        title: "Joy & Excitement",
        desc: "I want to smile every time I start the engine",
        icon: "/commanding view icons/depends.svg",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.COMFORT,
        },
      },
    ],
  },
  {
    id: "perfect_morning",
    type: "PhotoQuestion",
    title: "Which morning feels most like your real life?",
    tip: "Which morning do you usually wake up to — pick what feels real",
    options: [
      {
        key: "calm_breakfast",
        title: "Calm breakfast",
        src: "/perfect morning-quiz/Calm breakfast.jpg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        key: "fast_commute",
        title: "Fast-paced commute",
        src: "/perfect morning-quiz/Fast-paced commute.jpg",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        key: "gym_workout",
        title: "Gym or early workout",
        src: "/perfect morning-quiz/Gym or early workout.jpg",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        key: "outdoor_walk",
        title: "Outdoor walk / dog",
        src: "/perfect morning-quiz/Outdoor walk : dog.jpg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        key: "quiet_coffee",
        title: "Quiet coffee alone",
        src: "/perfect morning-quiz/Quiet coffee alone.jpg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        key: "family_chaos",
        title: "Family chaos morning",
        src: "/perfect morning-quiz/Family chaos morning.jpg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
    ],
  },
  {
    id: "bad_weather_focus",
    type: "ChoiceQuestion",
    title: "Imagine the weather suddenly turns bad while you need to drive. What do you focus on first?",
    options: [
      {
        label: "I choose the simplest, safest way to get where I need to go",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.CITY,
        },
      },
      {
        label: "I rely on the car to stay stable and predictable in all conditions",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "I enjoy having full control and adapting my driving to the situation",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.ADVENTURE,
        },
      },
    ],
  },
  {
    id: "unexpected_changes",
    type: "MultiChoiceQuestion",
    title: "How do you handle unexpected changes?",
    tip: "Choose what feels automatic — you can select one or more options",
    minSelect: 1,
    options: [
      {
        label: "Adapt quickly and take charge",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.ADVENTURE,
        },
      },
      {
        label: "Pause, analyze, create structure",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Stay calm and keep things steady",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Ask for support and coordinate together",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Feel energized by unpredictability",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        label: "Keep going without pausing",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.PERFORMANCE,
        },
      },
    ],
  },
  {
    id: "noise_level",
    type: "IconChoiceQuestion",
    title: "As You Drive, What Sound Feels Right to You?",
    tip: "Focus on what relaxes or energizes you during drives.",
    options: [
      {
        key: "near_silence",
        title: "Near-Silence",
        desc: "A serene cabin where you hear only whispers and refinement",
        icon: "/noise level icons/near-silence.svg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.LUXURY,
        },
      },
      {
        key: "natural_ambient",
        title: "Natural Ambient Sound",
        desc: "Balanced road noise that keeps you connected to the drive",
        icon: "/noise level icons/natural-ambient.svg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        key: "engine_sound",
        title: "Engine Sound Energizes Me",
        desc: "The roar and rumble that makes every acceleration thrilling",
        icon: "/noise level icons/engine-sound.svg",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.PERFORMANCE,
        },
      },
    ],
  },
  {
    id: "freedom_feel",
    type: "MultiPhotoQuestion",
    title: "Who Will Regularly Ride in This Car With You?",
    tip: "Think about who is actually in the car most weeks — not occasionally. You can select more than one option.",
    minSelect: 1,
    options: [
      {
        key: "mostly_me",
        title: "Mostly just me",
        src: "/passengers/Mostly just me.jpg",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        key: "one_partner",
        title: "One partner",
        src: "/passengers/_One partner.jpg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.ROAD_TRIP,
        },
      },
      {
        key: "children_car_seats_school_runs",
        title: "Children",
        src: "/passengers/car seats.jpg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        key: "dog_or_pets",
        title: "Pets",
        src: "/passengers/dog.jpg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "friends_passengers_often",
        title: "Friends",
        src: "/passengers/passengers.jpg",
        categories: {
          primary: Categories.ROAD_TRIP,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        key: "work_crew_clients",
        title: "Work crew",
        src: "/passengers/client.jpg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.ADVENTURE,
        },
      },
    ],
  },
  {
    id: "parking_location",
    type: "PhotoQuadQuestion",
    title: "Where Do You Usually Park Your Car?",
    tip: "Think about your most common parking situation.",
    imageBasePath: "/croped pictures",
    mobileSuffix: "mob",
    options: [
      {
        label: "Street parking",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Garage at home",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Shared parking",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.CITY,
        },
      },
      {
        label: "Various locations",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PRACTICALITY,
        },
      },
    ],
  },
  {
    id: "home_feel",
    type: "PhotoQuestion",
    title: "What Does Your Ideal Home Feel Like?",
    tip: "Your car often reflects the same values as your home.",
    options: [
      {
        key: "modern_minimalist",
        title: "Modern & Minimalist",
        src: "/home/Minimalist.jpg",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "cozy_traditional",
        title: "Cozy & Traditional",
        src: "/home/cozy family home.jpg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        key: "industrial_open",
        title: "Industrial & Open",
        src: "/home/_Urban apartment.jpg",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        key: "luxurious_detailed",
        title: "Luxurious & Detailed",
        src: "/home/Modern designer house.jpg",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "eco_friendly_natural",
        title: "Eco-friendly & Natural",
        src: "/home/house near nature.jpg",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        key: "smart_tech_filled",
        title: "Smart & Tech-filled",
        src: "/home/Suburban house with driveway, garage, and practical layout .jpg",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.LUXURY,
        },
      },
    ],
  },
  {
    id: "manage_risks",
    type: "ChoiceQuestion",
    title: "How Do You Manage Risks?",
    tip: "Think about financial, emotional, and practical risks in real life.",
    options: [
      {
        label: "Avoid them when possible",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Prepare with research",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Take calculated risks",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        label: "Follow instinct in the moment",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.ADVENTURE,
        },
      },
      {
        label: "Seek support or consensus",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.COMFORT,
        },
      },
    ],
  },
  {
    id: "purchase_approach",
    type: "ChoiceQuestion",
    title: "How do you approach big purchases?",
    tip: "Think of your real habits",
    options: [
      {
        label: "Value & low long-term cost",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Balanced price/features",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "Pay more for quality",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Emotional purchases",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "Research deeply",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.PRACTICALITY,
        },
      },
    ],
  },
  {
    id: "car_cargo_preference",
    type: "PhotoQuestion",
    title: "What Will This Car Most Often Carry?",
    tip: "Choose what realistically ends up inside the car, week after week.",
    options: [
      {
        key: "groceries",
        title: "Groceries",
        src: "/stuff/car daily errands.jpg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.CITY,
        },
      },
      {
        key: "sports_gear",
        title: "Sports gear",
        src: "/stuff/bike.jpg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        key: "large_items",
        title: "Oversized items",
        src: "/stuff/Things that don’t fit in most cars.jpg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        key: "luggage",
        title: "Luggage for trips",
        src: "/stuff/_Luggage.jpg",
        categories: {
          primary: Categories.ROAD_TRIP,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        key: "kids_stuff",
        title: "Kids’ stuff",
        src: "/stuff/Stroller.jpg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        key: "work_equipment",
        title: "Work equipment",
        src: "/stuff/tools.jpg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PRACTICALITY,
        },
      },
    ],
  },
  {
    id: "maintenance_involvement",
    type: "SliderQuestion",
    title: "How Involved Do You Want to Be in Car Maintenance?",
    tip: "Think about servicing, repairs, and ongoing care.",
    min: 0,
    max: 100,
    step: 1,
    labels: [
      "I want minimal involvement",
      "I’m okay with routine care",
      "I like to stay fully involved",
    ],
    categoryRanges: [
      {
        min: 0,
        max: 10,
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        min: 11,
        max: 20,
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        min: 21,
        max: 30,
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        min: 31,
        max: 40,
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        min: 41,
        max: 50,
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        min: 51,
        max: 60,
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        min: 61,
        max: 70,
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        min: 71,
        max: 80,
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.ADVENTURE,
        },
      },
      {
        min: 81,
        max: 90,
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        min: 91,
        max: 100,
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
    ],
  },
  {
    id: "people_descriptors",
    type: "TableTagQuestion",
    title: "People close to you would describe you as…",
    tip: "Select up to 3 that truly reflect how others see you",
    tags: [
      {
        label: "Responsive",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.CITY,
        },
      },
      {
        label: "Urban-minded",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Taste-driven",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Efficient",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Adaptable",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Future-focused",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "Self-sufficient",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Attentive",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Driven",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "Routine-loving",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Cost-aware",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Outdoorsy",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.ROAD_TRIP,
        },
      },
      {
        label: "Status-conscious",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        label: "Cautious",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Low-maintenance",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "Decisive",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Curious",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        label: "Travel-oriented",
        categories: {
          primary: Categories.ROAD_TRIP,
          secondary: Categories.ADVENTURE,
        },
      },
      {
        label: "Relaxed",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Organized",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
    ],
    minSelect: 1,
    maxSelect: 3,
  },
  {
    id: "hard_week_treat",
    type: "MultiChoiceQuestion",
    title: "How Do You Treat Yourself After a Hard Week?",
    tip: "Choose what you do regularly, not what you wish you did.",
    minSelect: 1,
    options: [
      {
        label: "Luxury meal or indulgence",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Long reflective drive",
        categories: {
          primary: Categories.ROAD_TRIP,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Outdoor physical adventure",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        label: "Resting quietly at home",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Keeping things simple and low-cost",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.PRACTICALITY,
        },
      },
    ],
  },
  {
    id: "decision_style",
    type: "MultiChoiceQuestion",
    title: "How Do You Usually Make Important Decisions?",
    tip: "Think about your last three important decisions.",
    minSelect: 1,
    options: [
      {
        label: "I compare options, look at data, and choose what makes the most sense",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "I trust my gut feeling and decide based on what feels right",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "I focus on real-world usefulness and long-term value",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "I consider how my choice affects others and shared comfort",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "I choose what moves me forward and reflects my goals",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
    ],
  },
  {
    id: "driving_position_preference",
    type: "IconChoiceQuestion",
    title: "What Driving Position Feels Right to You?",
    tip: "Choose the position that makes you feel most at ease and in control.",
    options: [
      {
        key: "high_commanding",
        title: "High & commanding",
        desc: "I like seeing over traffic and feeling in control",
        icon: "/commanding view icons/important.svg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        key: "balanced_flexible",
        title: "Balanced & flexible",
        desc: "I’m comfortable either way, depending on the situation",
        icon: "/commanding view icons/helpful.svg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "low_connected",
        title: "Low & connected",
        desc: "I prefer feeling close to the road and the car",
        icon: "/commanding view icons/not-important.svg",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "context_driven",
        title: "Context-driven",
        desc: "It depends on the drive, mood, and surroundings",
        icon: "/commanding view icons/depends.svg",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.PRACTICALITY,
        },
      },
    ],
  },
  {
    id: "car_expenses_preference",
    type: "ChoiceQuestion",
    title: "How Do You Prefer to Handle Car Expenses?",
    tip: "Think about fuel, maintenance, insurance, and unexpected costs.",
    options: [
      {
        label: "Keep costs as low as possible",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Balanced spending for comfort and reliability",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Pay more if it improves quality and experience",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Costs don’t worry me if the car fits my needs",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        label: "I plan expenses carefully long-term",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "I’m fine with higher costs for performance or tech",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
    ],
  },
  {
    id: "fuel_importance",
    type: "ChoiceQuestion",
    title: "How Important Are Fuel Costs to You?",
    tip: "Be honest about what you're comfortable spending monthly on fuel or charging.",
    options: [
      {
        label: "Not a concern — performance matters more",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "I'd prefer efficiency, but it's not a dealbreaker",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "Important — fuel costs should fit my budget",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Top priority — I want minimal fuel/energy costs",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.TECHNOLOGY,
        },
      },
    ],
  },
  {
    id: "interior_feel",
    type: "ChoiceQuestion",
    title: "How should your car feel inside?",
    tip: "Imagine the interior you’d want to spend hours in — not just minutes. Choose the atmosphere that feels like a place you could genuinely live your life in, not just pass through",
    options: [
      {
        label: "A clean, calming environment with uncluttered design and soft silence — a space that helps you breathe and think clearly.",
        mobileLabel: "Clean, calming, uncluttered design, soft silence.",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "A tight, energetic cabin that sharpens your senses and puts you in command of every moment on the road.",
        mobileLabel: "Tight, energetic cabin, puts you in command.",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "A smooth, elegant interior with premium textures, warm lighting, and details that feel intentionally crafted.",
        mobileLabel: "Smooth, elegant, premium textures, warm lighting.",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "A warm, intuitive space designed for comfort, connection, and the realities of everyday life.",
        mobileLabel: "Warm, intuitive, comfortable, everyday practical.",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "A modern, innovative cockpit filled with smart features, intuitive screens, and a sense of effortless progress.",
        mobileLabel: "Modern, innovative cockpit, smart features.",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "A strong, practical environment built to handle gear, weather, and daily tasks without hesitation.",
        mobileLabel: "Strong, practical, built for gear and daily tasks.",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.ADVENTURE,
        },
      },
    ],
  },
  {
    id: "interior_space_relation",
    type: "PhotoQuadQuestion",
    title: "Your Preferred Relationship With Space Inside a Car",
    tip: "Consider your longest weekly drive — which space feels right?",
    imageBasePath: "/croped pictures 2",
    mobileSuffix: "mob",
    options: [
      {
        label: "Spacious",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.ROAD_TRIP,
        },
      },
      {
        label: "Compact",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "Flexible",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Cockpit-like",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.TECHNOLOGY,
        },
      },
    ],
  },
  {
    id: "technology_relationship",
    type: "TableTagQuestion",
    title: "You Wake Up and Technology Is Everywhere Around You — How Do You React?",
    tip: "Select the tags you actually live by, not the ones that sound ideal.",
    tags: [
      {
        label: "Love futuristic tools",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "Early adopter",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.PERFORMANCE,
        },
      },
      {
        label: "Cutting-edge matters",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "Tech should simplify life",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        label: "Hands-off automation",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Smart assistants help",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Data-driven decisions",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        label: "Tech should be invisible",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Ease of use first",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Prefer simple systems",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Avoid complexity",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "Prefer manual control",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Upgrade often",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.LUXURY,
        },
      },
      {
        label: "Tech boosts productivity",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        label: "Tech can overwhelm me",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Value reliability",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        label: "Cost-conscious with tech",
        categories: {
          primary: Categories.EFFICIENCY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Like personalization",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        label: "Enjoy privacy",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "Human touch matters",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.PRACTICALITY,
        },
      },
    ],
    minSelect: 2,
    maxSelect: 5,
  },
  {
    id: "control_preference",
    type: "IconChoiceQuestion",
    title: "How Much Control Do You Want While Driving?",
    tip: "Imagine the car reacting under your hands — what level feels right?",
    options: [
      {
        key: "prefer_automation",
        title: "Prefer Automation",
        desc: "Let the car handle the driving while you focus on other things",
        icon: "/control icons/radar.svg",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "balanced_assist",
        title: "Balanced Assist",
        desc: "I want safety features but I still want to drive",
        icon: "/control icons/shared-responsibility.svg",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        key: "full_control",
        title: "Full Driver Control",
        desc: "I want to feel everything the car is doing without interference",
        icon: "/control icons/full-mechanical-feedback.svg",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.PRACTICALITY,
        },
      },
    ],
  },
  {
    id: "patience_level",
    type: "ChoiceQuestion",
    title: "How Patient Are You in Traffic?",
    tip: "Be honest — how do you really react when things slow down?",
    options: [
      {
        label: "I get frustrated easily and want to move",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.CITY,
        },
      },
      {
        label: "I stay calm and listen to music or podcasts",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.ROAD_TRIP,
        },
      },
      {
        label: "I use the time to think or make calls",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        label: "I find alternate routes immediately",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.TECHNOLOGY,
        },
      },
    ],
  },
  {
    id: "ideal_weekend",
    type: "PhotoQuestion",
    title: "It’s a Free Weekend — Where Are You Headed?",
    tip: "Pick the scene that makes you feel most like yourself.",
    options: [
      {
        key: "city_nightlife",
        title: "City Nightlife",
        src: "/weekend/City nightlife.jpg",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.LUXURY,
        },
      },
      {
        key: "road_trip",
        title: "Road Trip",
        src: "/weekend/Road trip.jpg",
        categories: {
          primary: Categories.ROAD_TRIP,
          secondary: Categories.ADVENTURE,
        },
      },
      {
        key: "outdoors_hiking",
        title: "Outdoors / Hiking",
        src: "/weekend/Outdoors _ hiking.jpg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.PRACTICALITY,
        },
      },
      {
        key: "relaxing_home",
        title: "Relaxing at Home",
        src: "/weekend/Relaxing at home.jpg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        key: "family_trip",
        title: "Family Trip",
        src: "/weekend/Family trip.jpg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.COMFORT,
        },
      },
      {
        key: "active_gym",
        title: "Gym / Active Day",
        src: "/weekend/Gym _ active day.jpg",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.EFFICIENCY,
        },
      },
    ],
  },
  {
    id: "ownership_duration",
    type: "ChoiceQuestion",
    title: "How Long Do You Usually Keep a Car?",
    tip: "Think about your past history, not your intentions.",
    options: [
      {
        label: "I drive them until they stop running (10+ years)",
        categories: {
          primary: Categories.RELIABILITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        label: "I keep them for a good run (5-7 years)",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        label: "I switch every few years (3-4 years)",
        categories: {
          primary: Categories.TECHNOLOGY,
          secondary: Categories.COMFORT,
        },
      },
      {
        label: "I lease or change often (1-2 years)",
        categories: {
          primary: Categories.LUXURY,
          secondary: Categories.TECHNOLOGY,
        },
      },
      {
        label: "I change frequently whenever something new excites me",
        categories: {
          primary: Categories.PERFORMANCE,
          secondary: Categories.LUXURY,
        },
      },
    ],
  },
  {
    id: "car_size_scale",
    type: "IconChoiceQuestion",
    title: "What size feels most natural for your next car?",
    tip: "Don’t think about what you “should” drive — picture the size that feels effortless for your lifestyle, your roads, and your daily rhythm.",
    options: [
      {
        key: "small_agile",
        title: "Small & Agile",
        desc: "Easy to park, quick to move",
        icon: "/size-car icons/small.svg",
        categories: {
          primary: Categories.CITY,
          secondary: Categories.EFFICIENCY,
        },
      },
      {
        key: "mid_size_balanced",
        title: "Mid-Size & Balanced",
        desc: "Spacious but not overwhelming",
        icon: "/size-car icons/mid-size.svg",
        categories: {
          primary: Categories.PRACTICALITY,
          secondary: Categories.RELIABILITY,
        },
      },
      {
        key: "large_comfortable",
        title: "Large & Comfortable",
        desc: "Plenty of room for life",
        icon: "/size-car icons/large.svg",
        categories: {
          primary: Categories.COMFORT,
          secondary: Categories.ROAD_TRIP,
        },
      },
      {
        key: "oversized_powerful",
        title: "Oversized & Powerful",
        desc: "Presence you can feel",
        icon: "/size-car icons/oversized.svg",
        categories: {
          primary: Categories.ADVENTURE,
          secondary: Categories.LUXURY,
        },
      },
    ],
  },
];
