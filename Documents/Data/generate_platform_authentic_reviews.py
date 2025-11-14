"""
Platform-Authentic Review Generator for Frontier Communications
Matches EXACT format of scraped reviews from real platforms
Ready for seamless transition to real review scraping
"""

import json
import random
from datetime import datetime, timedelta
from collections import defaultdict

# ============================================================================
# PLATFORM-SPECIFIC CONFIGURATIONS
# ============================================================================

PLATFORM_CONFIGS = {
    "Trustpilot": {
        "has_title": True,
        "has_helpful_count": True,
        "date_format": "%Y-%m-%d",
        "verified_field": "verified_customer"
    },
    "BBB": {
        "has_title": True,
        "has_helpful_count": False,
        "date_format": "%m/%d/%Y",
        "verified_field": "verified_customer"
    },
    "Google Reviews": {
        "has_title": False,
        "has_helpful_count": True,
        "date_format": "%B %d, %Y",  # "January 15, 2024"
        "verified_field": "local_guide"
    },
    "ConsumerAffairs": {
        "has_title": True,
        "has_helpful_count": True,
        "date_format": "%m/%d/%Y",
        "verified_field": "verified_reviewer"
    },
    "Yelp": {
        "has_title": False,
        "has_helpful_count": True,
        "date_format": "%m/%d/%Y",
        "verified_field": None  # Yelp doesn't have verified badge
    }
}

# ============================================================================
# REVIEW TITLES (Platform-specific)
# ============================================================================

NEGATIVE_TITLES = [
    "Terrible Service",
    "Worst ISP Experience Ever",
    "Constant Outages and Poor Support",
    "False Advertising - Speeds Not as Promised",
    "Horrible Customer Service",
    "Billing Nightmare",
    "Save Your Money - Go Elsewhere",
    "Regret Switching to Frontier",
    "Unprofessional Installation",
    "Hidden Fees Everywhere",
    "Cannot Recommend",
    "Service Gets Worse Over Time",
    "Avoid if Possible",
    "Nightmare Experience",
    "Price Doubled After Promo",
    "Equipment Issues Non-Stop",
    "Support Refuses to Help",
    "Still Waiting for Resolution",
    "Billed for Service I Don't Have",
    "Cancellation Process is Impossible"
]

POSITIVE_TITLES = [
    "Great Service!",
    "Excellent Fiber Internet",
    "Finally Reliable Internet",
    "Best ISP I've Had",
    "Highly Recommend Frontier",
    "Fast and Reliable",
    "Good Value for Money",
    "Professional Installation",
    "Solid Performance",
    "Happy Customer",
    "Exceeded Expectations",
    "No Complaints",
    "Worth Every Penny",
    "Fantastic Customer Service",
    "Very Satisfied",
    "Fiber Changed Everything",
    "Smooth Experience",
    "Reliable and Fast",
    "Best Decision for Internet",
    "5 Stars - Would Recommend"
]

MIXED_TITLES = [
    "Decent Service with Some Issues",
    "Good Internet, Poor Support",
    "Mixed Experience",
    "Works Well When It Works",
    "Could Be Better",
    "Acceptable Service",
    "Hit or Miss",
    "Good Speed, High Price",
    "Okay Overall",
    "Room for Improvement"
]

# ============================================================================
# LOCATION DATA
# ============================================================================

LOCATIONS = {
    "urban": [
        "Los Angeles, CA", "San Diego, CA", "San Jose, CA", "San Francisco, CA", 
        "Fresno, CA", "Sacramento, CA", "Long Beach, CA", "Oakland, CA",
        "Houston, TX", "Dallas, TX", "San Antonio, TX", "Austin, TX",
        "Fort Worth, TX", "El Paso, TX", "Arlington, TX", "Corpus Christi, TX"
    ],
    "suburban": [
        "Riverside, CA", "Anaheim, CA", "Santa Ana, CA", "Irvine, CA",
        "Bakersfield, CA", "Fremont, CA", "Stockton, CA", "Glendale, CA",
        "Plano, TX", "Irving, TX", "Garland, TX", "Frisco, TX",
        "McKinney, TX", "Grand Prairie, TX", "Mesquite, TX", "Carrollton, TX"
    ],
    "rural": [
        "Rural Northern California", "Rural Central California", "Rural Southern California",
        "Rural North Texas", "Rural Central Texas", "Rural West Texas", "Rural South Texas"
    ]
}

# ============================================================================
# REVIEW TEMPLATES WITH VARIED LENGTHS
# ============================================================================

# VERY SHORT REVIEWS (20-50 words) - Common on Google/Yelp
SHORT_NEGATIVE = [
    "Terrible service. Internet goes down all the time. Called support multiple times, they never fix anything. Looking to switch ASAP.",
    "Speeds are nowhere near advertised. Paying for {speed} Mbps, getting maybe {actual} Mbps. Total ripoff.",
    "Worst customer service ever. Spent hours on hold just to get nowhere. Still have the same problem after 3 weeks.",
    "Bill keeps going up every month. Hidden fees everywhere. Not what was advertised at all.",
    "Installation took 3 visits and service still doesn't work properly. Completely unprofessional.",
]

SHORT_POSITIVE = [
    "Great internet! Fast speeds, reliable service. Had Frontier for 8 months now with no issues. Highly recommend.",
    "Finally have reliable internet in my area. Speeds are exactly as advertised. Very happy with the switch.",
    "Installation was quick and professional. Service has been rock solid. Best ISP I've had.",
    "Good value for the price. Speeds are consistent and customer service has been helpful when needed.",
    "Fiber is amazing! No more buffering. Work from home is so much easier now. 5 stars.",
]

# MEDIUM REVIEWS (75-150 words) - Most common
MEDIUM_NEGATIVE = [
    "I've been dealing with Frontier for {months} months now and it's been frustrating. The speeds are inconsistent - sometimes close to the advertised {speed} Mbps, other times dropping to {bad_speed} Mbps. This makes working from home nearly impossible during peak hours. Customer service is terrible - I've called {count} times about the speed issues and each time they run diagnostics, say everything looks fine, and nothing changes. The last technician admitted the area is oversold but said there's nothing they can do. On top of that, my promotional rate ended and the bill jumped from ${promo} to ${new_price} per month with no warning. Trying to negotiate got me nowhere. Really disappointed and actively looking at other providers. Would not recommend Frontier.",
    
    "Major issues with billing. Signed up at ${promo}/month but actual bill is ${actual} after all the fees they don't tell you about upfront. Equipment rental (${equip}/mo), broadcast fee (${tv}/mo), regional sports fee (${sports}/mo) - I don't even have TV! Called to complain and they basically said tough luck, it's in the fine print. Customer service was rude and unhelpful. Service itself is okay when it works but I've had {outages} outages in {period}. Each time I call they promise a credit that never appears on my bill. The whole experience feels scammy. Contract ends in {months_left} months and I'll be switching immediately. Check all the fees before signing up or you'll get burned like I did.",
    
    "Installation was supposed to happen {date1}. Technician never showed, never called. Rescheduled for {date2}, tech arrived {hours} hours late. Install took {install_time} hours and left cables running across my ceiling in the ugliest way possible. Asked about running them through walls, was told that costs extra. The router they provided is garbage - WiFi barely reaches my bedroom in a {sqft} sq ft apartment. Had to buy my own router for ${router_cost}. Service works okay but not worth the hassle. Support is slow to respond and unhelpful. Been with them {duration} and counting down until contract ends. Installation quality was unprofessional and the equipment is subpar. Would give zero stars if I could.",
]

MEDIUM_POSITIVE = [
    "Switched to Frontier Fiber {duration} ago and very happy with the decision. Previous provider ({competitor}) was unreliable with constant outages. Frontier has been solid - maybe one brief outage in {months} months. Speed tests consistently show {actual} Mbps on my {speed} Mbps plan which is great. Work from home daily with video calls and large file transfers, no issues at all. Price is ${price}/month which is reasonable for the speed. Installation was professional and on time. The tech explained everything and made sure I was satisfied before leaving. Customer service the one time I called was helpful and knowledgeable. Only minor complaint is the router could have better range, but it works fine for my needs. Overall very satisfied and would recommend to anyone in the area looking for fiber internet.",
    
    "Had Frontier for {months} months in {location} and it's been excellent. The {speed} Mbps fiber plan is perfect for our household - two people working from home plus kids streaming and gaming. Speeds are consistent throughout the day even during peak hours. Bill has stayed at ${price}/month as quoted, no surprise increases or hidden fees which is refreshing. Had one service issue early on and support resolved it quickly with a tech visit the next day. Installation was smooth, tech was professional and cleaned up after himself. The included router has good WiFi coverage for our {sqft} sq ft home. Coming from {competitor} where service was spotty and support was awful, this has been a huge upgrade. Highly recommend Frontier if fiber is available in your area.",
]

# LONG DETAILED REVIEWS (200-300 words) - Common on BBB, ConsumerAffairs, detailed complainers
LONG_NEGATIVE = [
    "Where do I even begin with this nightmare experience? I signed up for Frontier {months} months ago after their sales rep promised me {advertised} Mbps fiber for just ${promo_price}/month with 'no hidden fees.' That lasted exactly 12 months before my bill jumped to ${new_price}/month - over a {percent}% increase! When I called to ask why, they said the promotional period ended, which fine, I understand promos end. But the bill is itemized with all these fees that were never disclosed: ${equip_fee}/month equipment rental even though they said the router was 'included free,' ${broadcast_fee}/month broadcast TV surcharge for INTERNET ONLY service, ${regional_fee}/month regional sports fee (again, no TV service), and ${other_fees} in various mystery charges. The actual internet service itself is mediocre at best. Speed tests show I'm getting {actual_speed} Mbps on average instead of the promised {advertised} Mbps. That's only {percentage}% of what I'm paying for. During evening hours it's even worse, dropping to {evening_speed} Mbps making streaming nearly impossible. I work from home and the connection drops randomly throughout the day - I've lost count of how many times I've been kicked out of important video meetings. Customer service is absolutely useless. I've called {call_count} times over the past {weeks} weeks trying to get help. Each time I spend 45+ minutes on hold, get transferred multiple times, explain the whole situation again to each person, and nothing ever gets resolved. Last tech who visited said the local infrastructure is 'at capacity' and there's nothing they can do about speed issues. So why do they keep selling service in oversold areas? The early termination fee is ${termination_fee} which feels like being held hostage. I'm seriously considering paying it just to escape. Do NOT trust Frontier's advertising. The promotional price is fake, the speeds are fake, and support is nonexistent. Going to file complaints with FCC and BBB. You've been warned.",
    
    "I am beyond frustrated with Frontier's customer service. Three months ago I called to cancel my service because I was relocating to another state for work. I followed their cancellation process exactly as instructed - called their number, spoke to a retention specialist who tried to keep me as a customer, I declined, got a confirmation number for the cancellation, and returned their equipment to an authorized UPS location with a receipt. Everything by the book. Yet here I am THREE MONTHS LATER still being charged ${monthly_charge} every single month on my credit card! The first month I thought maybe it was just a billing cycle thing and they'd credit it next month. When the second charge hit, I called immediately. Spent over an hour on the phone getting transferred between departments. One rep said my account showed as cancelled, another said it was still active, a third claimed there was a 'pending disconnection order' that hadn't been processed. No one could give me a straight answer. I asked to speak to a supervisor and was told someone would call me back within 24-48 hours. That was three weeks ago - no callback. Third charge hits and I'm absolutely livid. I call again, demand to speak to billing supervisor, get told the same thing about a callback that never comes. Meanwhile I'm out ${total_charged} for service at an address I haven't lived at since {months_ago}! I've initiated chargebacks with my credit card company and filed complaints with the Better Business Bureau and my state's Attorney General office. Now Frontier has the audacity to send my account to collections for 'unpaid balances' - balances I DO NOT OWE because I cancelled properly! This is affecting my credit score. I've kept meticulous records of every call, every confirmation number, the equipment return receipt, everything. This company is either completely incompetent or deliberately defrauding customers. Either way it should be illegal. If you ever plan to cancel Frontier, be prepared to fight them for months to stop fraudulent charges. Absolutely criminal behavior from this company.",
]

LONG_POSITIVE = [
    "After years of struggling with {competitor}'s unreliable cable internet here in {location}, switching to Frontier Fiber has been absolutely life-changing for our household. Let me explain why this has been such a great experience from start to finish. The initial sales process was refreshingly straightforward - no high-pressure tactics, just clear information about what speeds were available at my address and honest pricing. I went with their {speed} Mbps plan for ${price}/month which seemed almost too good compared to the ${old_price} I was paying {competitor} for only {old_speed} Mbps. Installation was scheduled within a week and the techs showed up right on time in the promised window. They were professional, explained everything they were doing, and took care to run the fiber line neatly without damaging my landscaping. The whole setup took about two hours and they tested everything thoroughly before leaving, even helping me connect my smart home devices and optimize WiFi placement. Now for the actual service - it's been {months} months and I honestly cannot remember the last time we had any issues. Speed tests consistently show I'm getting the full {speed} Mbps I'm paying for, sometimes even slightly higher. This is actual fiber directly to the home, not the 'fiber to the neighborhood' fake fiber some ISPs advertise. The upstream is symmetrical too which is amazing for cloud backups and video uploads. I work entirely from home doing software development which means I'm on VPNs and video calls all day. My spouse also works remotely in graphic design uploading huge files. We have two teenagers who are constantly streaming, gaming online, and video chatting with friends. Plus all our IoT devices, smart TVs, tablets, etc. We regularly have 15-20 devices connected simultaneously and have never experienced any slowdown or congestion even during peak evening hours. Gaming latency is consistently under 15ms which my son says is excellent for competitive play. The reliability has been perfect - I think we've had exactly one outage in all this time and it was during a major thunderstorm that knocked out power to half the neighborhood. Service was restored within an hour of power coming back. The billing has been exactly as promised too - ${price} per month, no hidden fees, no surprise increases, no equipment rental charges because the router is included. After dealing with {competitor}'s bait-and-switch pricing tactics for years this transparency is so refreshing. The customer service the couple times I've needed to contact them has been responsive and knowledgeable. I highly recommend Frontier Fiber to anyone who has it available in their area. Best internet service I've had in my 20+ years as a consumer. Worth every penny.",
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def random_date_last_18_months():
    """Generate random date within last 18 months"""
    end = datetime.now()
    start = end - timedelta(days=545)
    time_between = end - start
    days_between = time_between.days
    random_days = random.randrange(days_between)
    return start + timedelta(days=random_days)

def format_date_for_platform(date_obj, platform):
    """Format date according to platform standards"""
    format_str = PLATFORM_CONFIGS[platform]["date_format"]
    return date_obj.strftime(format_str)

def random_name():
    """Generate random reviewer name"""
    first_names = ["John", "Sarah", "Michael", "Jessica", "David", "Emily", "Robert", "Ashley",
                   "James", "Amanda", "William", "Jennifer", "Richard", "Lisa", "Joseph", "Michelle",
                   "Thomas", "Nicole", "Christopher", "Karen", "Daniel", "Nancy", "Matthew", "Betty",
                   "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Carol", "Steve", "Linda",
                   "Paul", "Maria", "Andrew", "Susan", "Brian", "Angela", "Kevin", "Patricia"]
    last_initials = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "W", "Y", "Z"]
    
    if random.random() < 0.25:  # 25% anonymous
        return f"User{random.randint(1000, 9999)}"
    else:
        return f"{random.choice(first_names)} {random.choice(last_initials)}."

def substitute_variables(template):
    """Replace template variables with realistic values"""
    replacements = {
        "{months}": str(random.randint(3, 18)),
        "{speed}": str(random.choice([100, 200, 500, 1000])),
        "{advertised}": str(random.choice([100, 200, 500, 1000])),
        "{actual_speed}": str(random.randint(30, 100)),
        "{bad_speed}": str(random.randint(10, 40)),
        "{count}": str(random.randint(3, 8)),
        "{promo}": str(random.randint(30, 50)),
        "{new_price}": str(random.randint(90, 130)),
        "{price}": str(random.randint(50, 90)),
        "{promo_price}": str(random.randint(35, 55)),
        "{actual}": str(random.randint(90, 120)),
        "{percent}": str(random.randint(80, 150)),
        "{equip_fee}": str(random.randint(10, 15)),
        "{broadcast_fee}": str(random.randint(15, 25)),
        "{regional_fee}": str(random.randint(8, 15)),
        "{other_fees}": str(random.randint(10, 25)),
        "{percentage}": str(random.randint(35, 70)),
        "{evening_speed}": str(random.randint(15, 45)),
        "{call_count}": str(random.randint(4, 10)),
        "{weeks}": str(random.randint(2, 8)),
        "{termination_fee}": str(random.randint(200, 400)),
        "{monthly_charge}": str(random.randint(60, 110)),
        "{total_charged}": str(random.randint(180, 330)),
        "{months_ago}": random.choice(["April", "May", "June", "March", "July"]),
        "{duration}": random.choice(["6 months", "a year", "8 months", "10 months", "18 months"]),
        "{competitor}": random.choice(["Spectrum", "AT&T", "Xfinity", "Comcast", "Cox"]),
        "{location}": random.choice(["Dallas", "Houston", "San Diego", "Los Angeles", "Austin", "San Antonio"]),
        "{actual}": str(random.choice([480, 950, 190, 920])),
        "{old_price}": str(random.randint(90, 140)),
        "{old_speed}": str(random.choice([100, 200, 50])),
        "{sqft}": str(random.choice([1200, 1500, 1800, 2000, 2500])),
        "{router_cost}": str(random.randint(100, 200)),
        "{date1}": random.choice(["Monday", "last week", "two weeks ago"]),
        "{date2}": random.choice(["the next week", "5 days later"]),
        "{hours}": str(random.randint(2, 5)),
        "{install_time}": str(random.randint(3, 6)),
        "{outages}": str(random.randint(3, 8)),
        "{period}": random.choice(["two months", "the last three months", "six weeks"]),
        "{months_left}": str(random.randint(2, 8)),
    }
    
    result = template
    for key, value in replacements.items():
        result = result.replace(key, value)
    
    return result

def add_natural_language_variations(text):
    """Add typos, informal language to make more authentic (10% of reviews)"""
    if random.random() > 0.1:  # Only 10% get variations
        return text
    
    variations = [
        (" I ", " i "),  # lowercase I
        (".", ".."),  # extra periods
        ("!", "!!"),  # extra exclamation
        (" and ", " & "),  # ampersand
        ("you", "u"),  # text speak (rare)
        (" to ", " 2 "),  # text speak (rare)
    ]
    
    # Apply 1-2 random variations
    for _ in range(random.randint(1, 2)):
        if variations:
            old, new = random.choice(variations)
            if old in text:
                text = text.replace(old, new, 1)
    
    return text

def generate_review(sentiment_category, platform):
    """Generate a platform-authentic review"""
    
    # Determine rating and template pool based on sentiment
    if sentiment_category == "very_negative":
        rating = random.choice([1, 1, 1, 2])
        templates = SHORT_NEGATIVE + MEDIUM_NEGATIVE + LONG_NEGATIVE
        titles = NEGATIVE_TITLES
    elif sentiment_category == "negative":
        rating = random.choice([2, 2, 3])
        templates = SHORT_NEGATIVE + MEDIUM_NEGATIVE
        titles = NEGATIVE_TITLES + MIXED_TITLES
    elif sentiment_category == "positive":
        rating = random.choice([4, 4, 5])
        templates = SHORT_POSITIVE + MEDIUM_POSITIVE
        titles = POSITIVE_TITLES + MIXED_TITLES
    else:  # very_positive
        rating = 5
        templates = SHORT_POSITIVE + MEDIUM_POSITIVE + LONG_POSITIVE
        titles = POSITIVE_TITLES
    
    # Select template and generate text
    template = random.choice(templates)
    review_text = substitute_variables(template)
    review_text = add_natural_language_variations(review_text)
    
    # Location
    area_choice = random.choices(["urban", "suburban", "rural"], weights=[60, 30, 10])[0]
    location = random.choice(LOCATIONS[area_choice])
    
    # Date
    date_obj = random_date_last_18_months()
    date_str = format_date_for_platform(date_obj, platform)
    
    # Build review object with platform-specific fields
    config = PLATFORM_CONFIGS[platform]
    review = {
        "review_id": None,  # Will be set later
        "platform": platform,
        "date": date_str,
        "rating": rating,
        "reviewer_name": random_name(),
        "location": location,
        "review_text": review_text,
    }
    
    # Add title if platform supports it
    if config["has_title"]:
        review["title"] = random.choice(titles)
    
    # Add helpful count if platform supports it
    if config["has_helpful_count"]:
        # More helpful votes for longer, higher-quality reviews
        max_helpful = 50 if len(review_text.split()) > 150 else 20
        review["helpful_count"] = random.randint(0, max_helpful)
    
    # Add platform-specific verification field
    if config["verified_field"]:
        review[config["verified_field"]] = random.random() < 0.75  # 75% verified
    
    # Add review URL (what you'd get from scraping)
    review["review_url"] = f"https://example.com/reviews/{platform.lower().replace(' ', '')}/{random.randint(100000, 999999)}"
    
    return review

def generate_all_reviews(total=5000):
    """Generate all reviews with balanced distribution across platforms and sentiments"""
    
    reviews = []
    platforms = list(PLATFORM_CONFIGS.keys())
    sentiments = ["very_negative", "negative", "positive", "very_positive"]
    
    per_platform = total // len(platforms)
    per_sentiment = per_platform // len(sentiments)
    
    print(f"\nGenerating {total} platform-authentic reviews...")
    print(f"Platforms: {len(platforms)}")
    print(f"Per platform: {per_platform}")
    print(f"Per sentiment per platform: {per_sentiment}\n")
    
    for platform in platforms:
        print(f"Generating {platform} reviews...")
        for sentiment in sentiments:
            for _ in range(per_sentiment):
                reviews.append(generate_review(sentiment, platform))
    
    # Shuffle and assign IDs
    random.shuffle(reviews)
    for idx, review in enumerate(reviews, 1):
        review["review_id"] = idx
    
    return reviews

def generate_statistics(reviews):
    """Generate statistics about the dataset"""
    
    stats = {
        "total_reviews": len(reviews),
        "platform_distribution": defaultdict(int),
        "rating_distribution": defaultdict(int),
        "has_title_count": 0,
        "has_helpful_count": 0,
        "verified_count": 0,
        "word_count_stats": {
            "min": 0,
            "max": 0,
            "average": 0
        }
    }
    
    word_counts = []
    for review in reviews:
        stats["platform_distribution"][review["platform"]] += 1
        stats["rating_distribution"][review["rating"]] += 1
        if "title" in review:
            stats["has_title_count"] += 1
        if "helpful_count" in review:
            stats["has_helpful_count"] += 1
        
        # Check for any verification field
        for field in ["verified_customer", "verified_reviewer", "local_guide"]:
            if review.get(field) == True:
                stats["verified_count"] += 1
                break
        
        word_counts.append(len(review["review_text"].split()))
    
    word_counts.sort()
    stats["word_count_stats"] = {
        "min": min(word_counts),
        "max": max(word_counts),
        "average": sum(word_counts) / len(word_counts),
        "median": word_counts[len(word_counts) // 2]
    }
    
    # Convert defaultdicts
    stats["platform_distribution"] = dict(stats["platform_distribution"])
    stats["rating_distribution"] = dict(stats["rating_distribution"])
    
    return stats

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("PLATFORM-AUTHENTIC REVIEW GENERATOR")
    print("Matches exact format of scraped reviews for seamless integration")
    print("=" * 70)
    
    # Generate reviews
    reviews = generate_all_reviews(5000)
    
    # Generate statistics
    stats = generate_statistics(reviews)
    
    # Save reviews
    output_file = "frontier_reviews_5000_platform_authentic.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(reviews, f, indent=2, ensure_ascii=False)
    
    # Save statistics
    stats_file = "platform_review_statistics.json"
    with open(stats_file, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    
    # Print summary
    print(f"\n{'=' * 70}")
    print("GENERATION COMPLETE!")
    print(f"{'=' * 70}\n")
    
    print(f"[OK] Generated {len(reviews)} reviews")
    print(f"[FILE] Saved to: {output_file}")
    print(f"[STATS] Statistics saved to: {stats_file}\n")
    
    print("WORD COUNT STATISTICS:")
    print(f"  Average:  {stats['word_count_stats']['average']:.1f} words")
    print(f"  Median:   {stats['word_count_stats']['median']:.1f} words")
    print(f"  Range:    {stats['word_count_stats']['min']}-{stats['word_count_stats']['max']} words")
    
    print("\nPLATFORM DISTRIBUTION:")
    for platform, count in sorted(stats["platform_distribution"].items()):
        percentage = (count / len(reviews)) * 100
        print(f"   {platform:20s}: {count:4d} ({percentage:5.1f}%)")
    
    print("\nRATING DISTRIBUTION:")
    for rating in sorted(stats["rating_distribution"].keys()):
        count = stats["rating_distribution"][rating]
        percentage = (count / len(reviews)) * 100
        bar = "=" * int(percentage / 2)
        print(f"   {rating} star: {count:4d} ({percentage:5.1f}%) {bar}")
    
    print("\nPLATFORM-SPECIFIC FEATURES:")
    print(f"   Reviews with titles:      {stats['has_title_count']:4d} ({stats['has_title_count']/len(reviews)*100:5.1f}%)")
    print(f"   Reviews with helpful votes: {stats['has_helpful_count']:4d} ({stats['has_helpful_count']/len(reviews)*100:5.1f}%)")
    print(f"   Verified reviews:         {stats['verified_count']:4d} ({stats['verified_count']/len(reviews)*100:5.1f}%)")
    
    print(f"\n{'=' * 70}")
    print("Ready for seamless transition to real scraped reviews!")
    print(f"{'=' * 70}\n")

