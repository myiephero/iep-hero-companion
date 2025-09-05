// Comprehensive Educational Standards Database
// Real Common Core, NGSS, and State Standards for IEP Goal Alignment

export interface Standard {
  code: string;
  subject: string;
  grade: string;
  description: string;
  keywords: string[];
  domain?: string;
  category?: string;
  state?: string;
}

export interface AlignmentResult {
  primaryStandards: StandardMatch[];
  secondaryStandards: StandardMatch[];
  overallScore: number;
  recommendations: string[];
  confidence: number;
}

export interface StandardMatch {
  standard: Standard;
  score: number;
  matchedKeywords: string[];
  reasoning: string;
}

// Real Common Core ELA Standards Database
export const COMMON_CORE_ELA: Standard[] = [
  // Reading Literature
  {
    code: "CCSS.ELA-LITERACY.RL.K.1",
    subject: "ela",
    grade: "K",
    description: "With prompting and support, ask and answer questions about key details in a text.",
    keywords: ["ask questions", "answer questions", "key details", "text comprehension", "reading comprehension"],
    domain: "Reading Literature"
  },
  {
    code: "CCSS.ELA-LITERACY.RL.1.1",
    subject: "ela",
    grade: "1",
    description: "Ask and answer questions about key details in a text.",
    keywords: ["ask questions", "answer questions", "key details", "text comprehension", "reading comprehension"],
    domain: "Reading Literature"
  },
  {
    code: "CCSS.ELA-LITERACY.RL.2.1",
    subject: "ela",
    grade: "2",
    description: "Ask and answer such questions as who, what, where, when, why, and how to demonstrate understanding of key details in a text.",
    keywords: ["who what where when why how", "questions", "key details", "text comprehension", "reading comprehension"],
    domain: "Reading Literature"
  },
  {
    code: "CCSS.ELA-LITERACY.RL.3.1",
    subject: "ela",
    grade: "3",
    description: "Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.",
    keywords: ["ask questions", "answer questions", "text evidence", "reading comprehension", "text analysis"],
    domain: "Reading Literature"
  },
  {
    code: "CCSS.ELA-LITERACY.RF.K.1",
    subject: "ela",
    grade: "K",
    description: "Demonstrate understanding of the organization and basic features of print.",
    keywords: ["print concepts", "letters", "words", "sentences", "book orientation"],
    domain: "Reading Foundational Skills"
  },
  {
    code: "CCSS.ELA-LITERACY.RF.1.3",
    subject: "ela",
    grade: "1",
    description: "Know and apply grade-level phonics and word analysis skills in decoding words.",
    keywords: ["phonics", "decoding", "word analysis", "letter sounds", "reading fluency"],
    domain: "Reading Foundational Skills"
  },
  {
    code: "CCSS.ELA-LITERACY.RF.2.4",
    subject: "ela",
    grade: "2",
    description: "Read with sufficient accuracy and fluency to support comprehension.",
    keywords: ["reading fluency", "accuracy", "comprehension", "oral reading", "reading rate"],
    domain: "Reading Foundational Skills"
  },
  
  // Writing Standards
  {
    code: "CCSS.ELA-LITERACY.W.K.1",
    subject: "ela",
    grade: "K",
    description: "Use a combination of drawing, dictating, and writing to compose opinion pieces.",
    keywords: ["opinion writing", "drawing", "dictating", "writing composition"],
    domain: "Writing"
  },
  {
    code: "CCSS.ELA-LITERACY.W.1.1",
    subject: "ela",
    grade: "1",
    description: "Write opinion pieces in which they introduce the topic or name the book they are writing about and state an opinion or preference about the topic or book.",
    keywords: ["opinion writing", "topic introduction", "writing composition", "book response"],
    domain: "Writing"
  },
  {
    code: "CCSS.ELA-LITERACY.W.2.1",
    subject: "ela",
    grade: "2",
    description: "Write opinion pieces in which they introduce the topic or book they are writing about, state an opinion, supply reasons that support the opinion, and provide a concluding statement or section.",
    keywords: ["opinion writing", "supporting reasons", "conclusion", "writing structure"],
    domain: "Writing"
  },
  {
    code: "CCSS.ELA-LITERACY.W.3.1",
    subject: "ela",
    grade: "3",
    description: "Write opinion pieces on topics or texts, supporting a point of view with reasons.",
    keywords: ["opinion writing", "point of view", "supporting reasons", "argumentative writing"],
    domain: "Writing"
  },

  // Speaking and Listening
  {
    code: "CCSS.ELA-LITERACY.SL.K.1",
    subject: "ela",
    grade: "K",
    description: "Participate in collaborative conversations with diverse partners about kindergarten topics and texts with peers and adults in small and large groups.",
    keywords: ["collaborative conversations", "discussion", "oral communication", "social interaction"],
    domain: "Speaking and Listening"
  },
  {
    code: "CCSS.ELA-LITERACY.SL.1.4",
    subject: "ela",
    grade: "1",
    description: "Describe people, places, things, and events with relevant details, expressing ideas and feelings clearly.",
    keywords: ["describing", "relevant details", "oral expression", "clear communication"],
    domain: "Speaking and Listening"
  },
  {
    code: "CCSS.ELA-LITERACY.SL.2.6",
    subject: "ela",
    grade: "2",
    description: "Produce complete sentences when appropriate to task and situation in order to provide requested detail or clarification.",
    keywords: ["complete sentences", "oral communication", "appropriate language", "clarification"],
    domain: "Speaking and Listening"
  }
];

// Real Common Core Math Standards Database
export const COMMON_CORE_MATH: Standard[] = [
  // Counting and Cardinality
  {
    code: "CCSS.MATH.CONTENT.K.CC.A.1",
    subject: "math",
    grade: "K",
    description: "Count to 100 by ones and by tens.",
    keywords: ["counting", "numbers", "sequence", "skip counting", "number recognition"],
    domain: "Counting and Cardinality"
  },
  {
    code: "CCSS.MATH.CONTENT.K.CC.B.4",
    subject: "math",
    grade: "K",
    description: "Understand the relationship between numbers and quantities; connect counting to cardinality.",
    keywords: ["number quantity", "cardinality", "one-to-one correspondence", "counting"],
    domain: "Counting and Cardinality"
  },

  // Operations and Algebraic Thinking
  {
    code: "CCSS.MATH.CONTENT.1.OA.A.1",
    subject: "math",
    grade: "1",
    description: "Use addition and subtraction within 20 to solve word problems involving situations of adding to, taking from, putting together, taking apart, and comparing.",
    keywords: ["addition", "subtraction", "word problems", "problem solving", "within 20"],
    domain: "Operations and Algebraic Thinking"
  },
  {
    code: "CCSS.MATH.CONTENT.2.OA.A.1",
    subject: "math",
    grade: "2",
    description: "Use addition and subtraction within 100 to solve one- and two-step word problems involving situations of adding to, taking from, putting together, taking apart, and comparing.",
    keywords: ["addition", "subtraction", "word problems", "two-step problems", "within 100"],
    domain: "Operations and Algebraic Thinking"
  },
  {
    code: "CCSS.MATH.CONTENT.3.OA.A.1",
    subject: "math",
    grade: "3",
    description: "Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.",
    keywords: ["multiplication", "products", "groups", "arrays", "repeated addition"],
    domain: "Operations and Algebraic Thinking"
  },

  // Number and Operations in Base Ten
  {
    code: "CCSS.MATH.CONTENT.1.NBT.A.1",
    subject: "math",
    grade: "1",
    description: "Count to 120, starting at any number less than 120. In this range, read and write numerals and represent a number of objects with a written numeral.",
    keywords: ["counting to 120", "number writing", "numeral recognition", "number representation"],
    domain: "Number and Operations in Base Ten"
  },
  {
    code: "CCSS.MATH.CONTENT.2.NBT.A.1",
    subject: "math",
    grade: "2",
    description: "Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.",
    keywords: ["place value", "hundreds", "tens", "ones", "three-digit numbers"],
    domain: "Number and Operations in Base Ten"
  },
  {
    code: "CCSS.MATH.CONTENT.3.NBT.A.2",
    subject: "math",
    grade: "3",
    description: "Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and/or the relationship between addition and subtraction.",
    keywords: ["addition", "subtraction", "within 1000", "fluency", "place value", "algorithms"],
    domain: "Number and Operations in Base Ten"
  },

  // Measurement and Data
  {
    code: "CCSS.MATH.CONTENT.K.MD.A.1",
    subject: "math",
    grade: "K",
    description: "Describe measurable attributes of objects, such as length or weight. Describe several measurable attributes of a single object.",
    keywords: ["measurement", "attributes", "length", "weight", "describing objects"],
    domain: "Measurement and Data"
  },
  {
    code: "CCSS.MATH.CONTENT.1.MD.A.2",
    subject: "math",
    grade: "1",
    description: "Express the length of an object as a whole number of length units, by laying multiple copies of a shorter object (the length unit) end to end.",
    keywords: ["length measurement", "units", "measuring tools", "non-standard units"],
    domain: "Measurement and Data"
  },
  {
    code: "CCSS.MATH.CONTENT.2.MD.A.1",
    subject: "math",
    grade: "2",
    description: "Measure the length of an object by selecting and using appropriate tools such as rulers, yardsticks, meter sticks, and measuring tapes.",
    keywords: ["length measurement", "rulers", "measuring tools", "appropriate tools"],
    domain: "Measurement and Data"
  },
  {
    code: "CCSS.MATH.CONTENT.3.MD.A.1",
    subject: "math",
    grade: "3",
    description: "Tell and write time to the nearest minute and measure time intervals in minutes. Solve word problems involving addition and subtraction of time intervals in minutes.",
    keywords: ["telling time", "time intervals", "minutes", "time word problems"],
    domain: "Measurement and Data"
  }
];

// Next Generation Science Standards (NGSS)
export const NGSS_STANDARDS: Standard[] = [
  {
    code: "K-2-ETS1-1",
    subject: "science",
    grade: "K-2",
    description: "Ask questions, make observations, and gather information about a situation people want to change to define a simple problem that can be solved through the development of a new or improved object or tool.",
    keywords: ["engineering design", "problem solving", "observations", "questions", "tools"],
    domain: "Engineering Design"
  },
  {
    code: "K-LS1-1",
    subject: "science",
    grade: "K",
    description: "Use observations to describe patterns of what plants and animals (including humans) need to survive.",
    keywords: ["living things", "survival needs", "patterns", "observations", "plants", "animals"],
    domain: "Life Science"
  },
  {
    code: "1-LS1-1",
    subject: "science",
    grade: "1",
    description: "Use materials to design a solution to a human problem by mimicking how plants and/or animals use their external parts to help them survive, grow, and meet their needs.",
    keywords: ["biomimicry", "external parts", "survival", "design solutions", "animal structures"],
    domain: "Life Science"
  },
  {
    code: "2-LS4-1",
    subject: "science",
    grade: "2",
    description: "Make observations of plants and animals to compare the diversity of life in different habitats.",
    keywords: ["biodiversity", "habitats", "observations", "comparing", "diversity"],
    domain: "Life Science"
  },
  {
    code: "3-LS4-3",
    subject: "science",
    grade: "3",
    description: "Construct an argument that some animals and plants have internal and external structures that function to support survival, growth, reproduction, and behavior.",
    keywords: ["structures", "functions", "survival", "growth", "reproduction", "behavior", "argument"],
    domain: "Life Science"
  },
  {
    code: "K-PS2-1",
    subject: "science",
    grade: "K",
    description: "Plan and conduct an investigation to compare the effects of different strengths or different directions of pushes and pulls on the motion of an object.",
    keywords: ["forces", "motion", "pushes", "pulls", "investigation", "comparing"],
    domain: "Physical Science"
  },
  {
    code: "1-PS4-1",
    subject: "science",
    grade: "1",
    description: "Plan and conduct investigations to provide evidence that vibrating materials can make sound and that sound can make materials vibrate.",
    keywords: ["sound", "vibrations", "investigations", "evidence", "materials"],
    domain: "Physical Science"
  },
  {
    code: "2-PS1-1",
    subject: "science",
    grade: "2",
    description: "Plan and conduct an investigation to describe and classify different kinds of materials by their observable properties.",
    keywords: ["materials", "properties", "classification", "investigation", "observable"],
    domain: "Physical Science"
  },
  {
    code: "3-PS2-1",
    subject: "science",
    grade: "3",
    description: "Plan and conduct an investigation to provide evidence of the effects of balanced and unbalanced forces on the motion of an object.",
    keywords: ["balanced forces", "unbalanced forces", "motion", "investigation", "evidence"],
    domain: "Physical Science"
  }
];

// Social Studies Standards (National Council for Social Studies - NCSS)
export const SOCIAL_STUDIES_STANDARDS: Standard[] = [
  {
    code: "NCSS.D2.Civ.1.K-2",
    subject: "social",
    grade: "K-2",
    description: "Describe roles and responsibilities of people in authority.",
    keywords: ["authority", "roles", "responsibilities", "community helpers", "government"],
    domain: "Civics"
  },
  {
    code: "NCSS.D2.Civ.1.3-5",
    subject: "social",
    grade: "3-5",
    description: "Distinguish the responsibilities and powers of government officials at various levels and branches of government and in different times and places.",
    keywords: ["government officials", "responsibilities", "powers", "branches of government", "levels of government"],
    domain: "Civics"
  },
  {
    code: "NCSS.D2.His.1.K-2",
    subject: "social",
    grade: "K-2",
    description: "Create and use a sequence of events to describe changes that have occurred over time.",
    keywords: ["sequence", "chronology", "changes over time", "events", "timeline"],
    domain: "History"
  },
  {
    code: "NCSS.D2.His.1.3-5",
    subject: "social",
    grade: "3-5",
    description: "Create and use a chronological sequence of related events to compare developments that happened at the same time.",
    keywords: ["chronological sequence", "related events", "compare developments", "same time period"],
    domain: "History"
  },
  {
    code: "NCSS.D2.Geo.1.K-2",
    subject: "social",
    grade: "K-2",
    description: "Use maps, globes, and other simple geographic models to identify cultural and environmental characteristics of places.",
    keywords: ["maps", "globes", "geographic models", "cultural characteristics", "environmental characteristics"],
    domain: "Geography"
  },
  {
    code: "NCSS.D2.Eco.1.K-2",
    subject: "social",
    grade: "K-2",
    description: "Describe the roles of buyers and sellers in product markets.",
    keywords: ["buyers", "sellers", "markets", "products", "economic roles"],
    domain: "Economics"
  }
];

// All Standards Combined
export const ALL_STANDARDS: Standard[] = [
  ...COMMON_CORE_ELA,
  ...COMMON_CORE_MATH,
  ...NGSS_STANDARDS,
  ...SOCIAL_STUDIES_STANDARDS
];

// State-specific variations (sample for key states)
export const STATE_SPECIFIC_STANDARDS: { [state: string]: Standard[] } = {
  "California": [
    {
      code: "CA.ELD.PI.K.1",
      subject: "ela",
      grade: "K",
      description: "Contribute to conversations and express ideas by asking and answering yes-no and wh- questions and responding using gestures, words, and simple phrases.",
      keywords: ["English language development", "conversation", "questions", "responses"],
      domain: "English Language Development",
      state: "California"
    },
    {
      code: "CA.NGSS.K-ESS2-2",
      subject: "science",
      grade: "K",
      description: "Construct an argument supported by evidence for how plants and animals (including humans) can change the environment to meet their needs.",
      keywords: ["environment", "change", "plants", "animals", "evidence", "argument"],
      domain: "Earth Science",
      state: "California"
    }
  ],
  "Texas": [
    {
      code: "TEKS.K.110.11.b.1",
      subject: "ela",
      grade: "K",
      description: "Develop oral language and concepts of print needed for reading, including recognizing that spoken words can be represented by print for communication.",
      keywords: ["oral language", "print concepts", "spoken words", "communication"],
      domain: "Reading/Beginning Reading Skills",
      state: "Texas"
    },
    {
      code: "TEKS.K.111.2.b.1",
      subject: "math",
      grade: "K",
      description: "Count forward and backward to at least 20 with and without objects.",
      keywords: ["counting", "forward", "backward", "objects", "number sequence"],
      domain: "Number and Operations",
      state: "Texas"
    }
  ],
  "New York": [
    {
      code: "NYSLS.K.RL.1",
      subject: "ela",
      grade: "K",
      description: "With prompting and support, ask and answer questions about key details in a text.",
      keywords: ["questions", "key details", "text comprehension", "prompting", "support"],
      domain: "Reading Literature",
      state: "New York"
    }
  ],
  "Florida": [
    {
      code: "LAFS.K.RL.1.1",
      subject: "ela",
      grade: "K",
      description: "With prompting and support, ask and answer questions about key details in a text.",
      keywords: ["questions", "key details", "text", "prompting", "support"],
      domain: "Reading Literature",
      state: "Florida"
    }
  ]
};