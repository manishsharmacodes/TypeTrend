"""
Curated passages for TypeTrend typing test across multiple categories and skill levels.
"""

PASSAGES = {
    "general": [
        {
            "id": "gen_1",
            "title": "The Art of Mastery",
            "category": "general",
            "text": "Mastery is not an overnight attainment but a continuous sequence of focused repetitions. When you sit down to type or craft any new skill, your nervous system gradually rewires itself. Every subtle rhythm of your fingers reflects hours of patient discipline and quiet focus."
        },
        {
            "id": "gen_2",
            "title": "Quiet Mornings",
            "category": "general",
            "text": "Early morning possesses a unique clarity before the world begins its clamor. With a fresh cup of coffee and the steady hum of concentration, words flow effortlessly across the screen. These peaceful moments remind us that genuine progress thrives in calm environments."
        },
        {
            "id": "gen_3",
            "title": "The Power of Curiosity",
            "category": "general",
            "text": "Curiosity is the true engine of human innovation. Throughout history, the greatest breakthroughs emerged not from those who claimed to know all answers, but from those brave enough to ask deeper questions and embrace the unknown."
        }
    ],
    "technology": [
        {
            "id": "tech_1",
            "title": "The Evolution of Computing",
            "category": "technology",
            "text": "Modern computing has transformed from room-sized vacuum tube mainframes into pocket-sized silicon chips executing billions of instructions every second. Distributed architectures, neural networks, and cloud pipelines now power real-time interactions across the globe."
        },
        {
            "id": "tech_2",
            "title": "Artificial Intelligence and Ethics",
            "category": "technology",
            "text": "As generative models and autonomous agents integrate into daily workflows, understanding algorithmic accountability becomes imperative. Developers must design systems that prioritize transparency, user privacy, and unbiased decision-making."
        },
        {
            "id": "tech_3",
            "title": "Responsive Web Ecosystems",
            "category": "technology",
            "text": "Building fluid web interfaces requires a deep appreciation of responsive design, dynamic layout rendering, and optimized network requests. Clean architectures elevate user experiences from ordinary pages into delightful interactive tools."
        }
    ],
    "programming": [
        {
            "id": "prog_1",
            "title": "Writing Clean Code",
            "category": "programming",
            "text": "Programs must be written for people to read, and only incidentally for machines to execute. Clear variable names, modular functions, and self-documenting logic reduce cognitive debt and make software resilient to unexpected edge cases."
        },
        {
            "id": "prog_2",
            "title": "Asynchronous JavaScript",
            "category": "programming",
            "text": "Handling concurrent tasks in modern web applications relies on asynchronous promises and async await syntax. By keeping the main UI thread non-blocking, web clients remain fluid and responsive even during heavy network operations."
        },
        {
            "id": "prog_3",
            "title": "Pythonic Data Structures",
            "category": "programming",
            "text": "Python emphasizes readability with elegant list comprehensions, generator expressions, and versatile dictionary mappings. Choosing the right data structure transforms slow quadratic algorithms into blazing fast linear operations."
        }
    ],
    "beginner": [
        {
            "id": "beg_1",
            "title": "Home Row Foundation",
            "category": "beginner",
            "text": "Keep your left fingers on keys A, S, D, and F. Keep your right fingers on keys J, K, L, and semicolon. Resting your index fingers on the tiny raised bumps helps you type smoothly without constantly glancing down at the keyboard."
        },
        {
            "id": "beg_2",
            "title": "Steady Rhythm",
            "category": "beginner",
            "text": "Speed comes naturally when you focus on accuracy first. Do not rush to hit the next key until your hands feel relaxed. A steady pace will always beat erratic bursts of speed that result in frequent typos."
        },
        {
            "id": "beg_3",
            "title": "Simple Everyday Words",
            "category": "beginner",
            "text": "The quick brown fox jumps over the lazy dog. Practice typing short and common words with confidence and consistency. Day by day, your muscle memory will grow stronger and faster."
        }
    ]
}

def get_passages_by_category(category="general"):
    """Returns passages for a category, falling back to all if category is 'all'."""
    if category in PASSAGES:
        return PASSAGES[category]
    if category == "all":
        all_list = []
        for cat_list in PASSAGES.values():
            all_list.extend(cat_list)
        return all_list
    return PASSAGES["general"]
