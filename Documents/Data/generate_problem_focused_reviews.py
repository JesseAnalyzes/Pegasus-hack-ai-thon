"""
Problem-Focused Review Generator for Frontier Communications
Generates 5000 reviews showcasing 6 critical problems:
1. Billing & Hidden Fees
2. Network Performance & Overselling
3. Customer Service Failures
4. Installation & Setup Problems
5. Equipment Quality Issues
6. Cancellation & Contract Nightmares
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
        "date_format": "%B %d, %Y",
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
        "verified_field": None
    }
}

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
# PROBLEM-SPECIFIC REVIEW TEMPLATES
# ============================================================================

# PROBLEM 1: BILLING & HIDDEN FEES
BILLING_REVIEWS = [
    # Short reviews
    "Bill jumped from $45 to $120/month after promo ended. No warning. Hidden fees everywhere. Total bait and switch.",
    "Signed up for $50/month, actual bill is $185. Equipment fees, broadcast fees, regional sports fees - I don't even have TV service!",
    "Promised $40/month, paying $150. They hide fees until after you sign. Scammy business practices.",
    "Billing nightmare. Charged for services I don't have. Called 5 times, still not fixed. Filed complaint with BBB.",
    
    # Medium reviews
    """I signed up for Frontier 14 months ago with a promotional rate of $45/month for 500 Mbps fiber. The sales rep was very clear that this was the total price with 'no hidden fees.' Fast forward to month 13, and my bill suddenly jumps to $127/month. When I called to ask why, they said the promotional period ended. Fine, I understand promos end. But then I look at the itemized bill and see: $12/month equipment rental (they said router was free), $18/month broadcast TV surcharge (I have INTERNET ONLY), $14/month regional sports fee (again, no TV), $8/month network enhancement fee, and $5/month regulatory recovery fee. That's $57 in hidden fees they never mentioned! When I called to complain, the rep was rude and said 'it's all in the fine print.' I asked to speak to a supervisor and was told someone would call back in 24-48 hours. That was 3 weeks ago - no callback. This is deceptive advertising. I'm switching as soon as my contract ends.""",
    
    """My promotional rate of $42/month just ended and my bill jumped to $135/month - a 221% increase! But that's not even the worst part. I've been charged $23/month for 'equipment rental' even though the sales rep explicitly told me the router was included at no cost. When I called billing, they said I signed a contract agreeing to equipment fees. I asked to see the contract and they said it's in my account documents. I checked - there's no mention of $23/month equipment fee in the contract I signed. They're literally making up charges. I've called 4 times, spent over 6 hours total on hold, and each time I get a different answer. One rep said they'd credit me $138 (6 months of incorrect charges), another said the fee is correct, a third said they'd escalate it. Nothing has been resolved. I'm filing complaints with the FCC and my state Attorney General. This is fraud.""",
    
    """I've been a Frontier customer for 8 months. Every single month, there's a billing error. Month 1: Charged for installation that was supposed to be free. Month 2: Double-billed for equipment. Month 3: Charged for a service tier I never ordered. Month 4: Promised a $50 credit for the previous errors, credit never appeared. Month 5: Charged for a technician visit that never happened. Month 6: Billed for equipment I returned 3 months ago. Month 7: Charged early termination fee even though I'm still under contract. Month 8: Current bill shows $200 when it should be $65. I've spent literally 20+ hours on the phone trying to fix these errors. Each time they promise to fix it, each time it doesn't get fixed. I've kept detailed records of every call, every confirmation number, every promise. I'm now working with a lawyer because this has become so time-consuming and stressful. This company's billing department is completely broken.""",
    
    # Long detailed reviews
    """Where do I even begin with this billing disaster? I signed up for Frontier Fiber 16 months ago. The sales representative came to my door and offered me 1 Gig fiber internet for $55/month with a 2-year price guarantee. I specifically asked about all fees and was told the only additional charge would be taxes. I signed up immediately because it seemed like a great deal. Fast forward 12 months, and my bill suddenly jumps to $89/month. I call and they say the price guarantee was only for 12 months, not 24. I check my contract - it clearly says "24-month price guarantee" but they claim it's a "typo" in the contract. Then month 13, my bill jumps again to $142/month. Now I'm seeing all these fees: $15/month router rental (they said it was free), $22/month broadcast TV surcharge (I have internet only!), $16/month regional sports fee (no TV service), $12/month network access fee, $8/month regulatory recovery fee, $5/month paper billing fee (I'm on autopay!), and $3/month "account maintenance fee." That's $81 in fees they never mentioned! When I called to dispute this, I was on hold for 52 minutes. The rep was completely unhelpful and kept reading from a script. I asked for a supervisor and was told one would call me back within 48 hours. No callback. I called again 5 days later, on hold for 38 minutes, got a different rep who said they'd credit me $200 for the incorrect charges. That was 3 weeks ago - no credit has appeared. I've called 6 more times since then, each time getting a different story. One rep said the fees are correct, another said they'd investigate, a third said they'd escalate to billing department, a fourth said I need to send written documentation. I've now spent over 15 hours on the phone trying to resolve this. I've filed complaints with the Better Business Bureau, the FCC, and my state's Public Utilities Commission. This is beyond frustrating - it's fraudulent. The deceptive pricing and hidden fees should be illegal. I'm documenting everything and considering a class action lawsuit. If you're thinking about Frontier, RUN. The low promotional price is a trap to lock you into a contract, then they hit you with hundreds of dollars in hidden fees.""",
]

# PROBLEM 2: NETWORK PERFORMANCE & OVERSELLING
NETWORK_REVIEWS = [
    # Short reviews
    "Paying for 500 Mbps, getting 25 Mbps during peak hours. Area is oversold. Tech admitted it but said nothing can be done.",
    "Internet drops 3-4 times per day. Unreliable for work from home. Support says 'everything looks fine' every time.",
    "Speed tests show 15 Mbps on a 1 Gig plan. Complete waste of money. Switching to competitor immediately.",
    "Constant outages. 8 outages in 2 months. Each one lasts 4-6 hours. Unacceptable for remote work.",
    
    # Medium reviews
    """I've been with Frontier for 11 months and the network performance has been terrible. I pay for 500 Mbps fiber, but speed tests consistently show I'm only getting 30-45 Mbps during peak hours (6pm-11pm). During the day it's better - maybe 180 Mbps - but still nowhere near what I'm paying for. I work from home and need reliable internet for video calls and large file transfers. The connection drops randomly throughout the day, usually 2-3 times, and each drop lasts 5-15 minutes. I've called support 7 times about this. Each time they run remote diagnostics and say "everything looks fine on our end." I've had 2 technicians come out. The first one replaced my router (didn't help). The second technician was honest with me - he said the area is "oversold" and the local infrastructure can't handle the number of customers. He said there's nothing they can do about it and that many customers in my area have the same complaint. So basically, they're selling service they can't deliver. I'm paying for 500 Mbps and getting 6% of that during the times I actually need it. This is false advertising. I'm switching to a competitor as soon as my contract ends.""",
    
    """The network reliability is absolutely terrible. I've had 12 outages in the past 3 months. Each outage lasts anywhere from 2 hours to 8 hours. The longest one was 14 hours. I work from home full-time, so every outage costs me money. I've lost count of how many important video meetings I've been kicked out of. When I call to report outages, they always say "we're aware of the issue and working on it" but never give me a timeline. The last outage, I called after 4 hours and asked when service would be restored. The rep said "we don't have an estimated time." I asked if I could get a credit for the downtime and was told "we don't offer credits for outages." Are you kidding me? I'm paying for a service I'm not receiving. The outages seem to happen most often during bad weather, but also randomly on clear days. I've had neighbors with other ISPs who don't experience these issues, so it's clearly a Frontier infrastructure problem. I'm actively looking for alternatives and will switch the moment I find one.""",
    
    """I live in a rural area and Frontier is basically the only option. I signed up for their 200 Mbps plan 9 months ago. The speeds are incredibly inconsistent. Sometimes I'll get 180 Mbps, other times it drops to 8 Mbps. There's no pattern - it's completely random. During evening hours (when my family actually uses the internet), speeds are consistently terrible - usually 10-20 Mbps. My kids can't stream Netflix without constant buffering. I can't work from home because video calls freeze and drop. Online gaming is impossible due to high latency and packet loss. I've called support multiple times. They always say the same thing: "We'll run diagnostics and get back to you." They never get back to me. I've had one technician visit. He tested the line and said "the signal is weak but within acceptable parameters." Acceptable for who? Not for me. I'm paying $85/month for service that doesn't work. I feel trapped because there are no other options in my area. This is a monopoly situation and Frontier is taking advantage of it by providing substandard service.""",
    
    # Long detailed reviews
    """I need to warn everyone about Frontier's network performance issues, especially if you're considering them for work-from-home or if you live in an oversold area. I signed up for Frontier Fiber 1 Gig service 14 months ago. The sales pitch was great - symmetrical 1 Gig up and down, low latency, perfect for remote work. The installation went smoothly and the first month was actually pretty good - I was getting 850-920 Mbps consistently. But then things started to degrade. Month 2, speeds started dropping during peak hours (evenings and weekends) to 200-300 Mbps. Still usable, but not what I paid for. Month 3, peak hour speeds dropped to 100-150 Mbps. Month 4, they dropped to 50-80 Mbps. Month 5, I was getting 20-40 Mbps during peak hours. Now, 14 months in, I'm lucky to get 15 Mbps during peak hours. That's 1.5% of what I'm paying for! I work as a software engineer from home. I need to download large code repositories, upload builds, participate in video calls, and access remote servers. With 15 Mbps, my work is nearly impossible. I've called Frontier support 12 times about this. Each call follows the same pattern: 30-45 minute wait, get a rep who runs remote diagnostics, they say "everything looks fine on our end, try restarting your router," I explain I've already done that 50 times, they schedule a technician visit. I've had 4 technician visits. Technician #1: Replaced the router, didn't help. Technician #2: Checked the fiber connection, said it was fine, replaced some equipment, didn't help. Technician #3: Tested speeds and confirmed they were slow, said he'd escalate to network engineering, nothing happened. Technician #4: This guy was actually honest. He told me that my neighborhood is "severely oversold" - Frontier has sold service to way more customers than the local infrastructure can support. During peak hours, when everyone is using the internet, the network gets congested and speeds drop dramatically. He said this is a known issue in my area and that many customers have complained, but Frontier won't invest in upgrading the infrastructure because it's expensive. He said the only solution is to either move or wait for Frontier to eventually upgrade (which could be years). So basically, Frontier is knowingly selling service they can't deliver. This is fraud. I'm paying $95/month for 1 Gig service and getting 15 Mbps during the times I actually need it. I've documented everything - speed tests at different times of day, call logs, technician visit reports. I'm filing complaints with the FCC and considering legal action. If you're in an area where Frontier is aggressively marketing, be very careful - they might be overselling and you'll end up with unusable service like me.""",
]

# PROBLEM 3: CUSTOMER SERVICE FAILURES
CUSTOMER_SERVICE_REVIEWS = [
    # Short reviews
    "Spent 2 hours on hold, got transferred 5 times, problem still not fixed. Worst customer service ever.",
    "Called 8 times about same issue. Each time they say they'll call back. Never do. Completely useless support.",
    "Customer service is a joke. Rude, unhelpful, and clearly reading from scripts. No one actually helps.",
    "On hold for 67 minutes, then call dropped. Called back, another 45 minute wait. This is unacceptable.",
    
    # Medium reviews
    """I've been trying to resolve a billing issue for 3 months now. I've called Frontier customer service 9 times. Here's what happens every single time: I wait on hold for 30-60 minutes. I finally get a rep who asks me to explain the entire situation from the beginning (even though I have a case number). I explain the problem. They say "let me look into that" and put me on hold for another 10-15 minutes. They come back and say "I need to transfer you to the billing department." I get transferred, wait on hold again for 20-30 minutes. The billing rep asks me to explain everything again. They say they'll fix it and I'll see a credit on my next bill. Next bill comes - no credit, problem still there. I call again, repeat the entire process. It's been 3 months and 9 phone calls totaling over 12 hours of my time, and the problem still isn't fixed. I've asked to speak to supervisors multiple times - they always say "a supervisor will call you back within 24-48 hours." I've never received a single callback. This is the worst customer service I've ever experienced. They clearly don't care about actually solving problems.""",
    
    """The customer service is absolutely terrible. I had a service outage that lasted 18 hours. I called to report it and was on hold for 52 minutes. When I finally got through, the rep was clearly reading from a script and had no idea what to do. She said "we're aware of the issue" and hung up. I called back 4 hours later (still no service) and was on hold for 38 minutes. This time the rep said "there's no reported outage in your area" even though I just called about it. I asked to speak to a supervisor and was told "supervisors don't take calls, but one will call you back." No one ever called. The service came back on its own 18 hours after it went out. I called to request a credit for the downtime and was told "we don't offer credits for outages." I asked to speak to someone who could help and was transferred, then the call dropped. I called back, waited on hold for 45 minutes, and was told the same thing. This company's customer service is completely broken. They don't help, they don't follow through, and they don't care.""",
    
    """I've had the same technical issue for 6 weeks now. My internet randomly disconnects 3-4 times per day. I've called Frontier support 11 times. Each call is the same frustrating experience: Long wait time (average 40 minutes), get a rep who runs the same diagnostics I've already done, they say "everything looks fine," I explain the problem is still happening, they say "try restarting your router" (I've done this 100 times), they say they'll send a technician, technician comes and can't reproduce the issue because it's intermittent, nothing gets fixed. I've asked to speak to technical support supervisors, network engineers, anyone who might actually be able to help. I'm always told "they don't take calls but someone will call you back." I've never received a single callback. I've tried their online chat - same thing, they just run the same useless diagnostics. I've tried their email support - no response after 2 weeks. I'm at my wit's end. The problem is clearly on their end (equipment issue, network issue, something), but they refuse to actually investigate it. They just keep running the same scripted responses and hoping I'll give up. Well, I'm giving up on Frontier. Switching to a competitor who actually has customer support.""",
    
    # Long detailed reviews
    """I need to share my absolutely horrific experience with Frontier's customer service. This is a cautionary tale for anyone considering this company. I've been a Frontier customer for 18 months. For the first 12 months, service was fine and I never needed to contact support. Then the problems started. Month 13, my promotional rate ended and my bill jumped from $50 to $130. I called to see if I could get a better rate. Here's what happened: Call #1: Waited on hold for 47 minutes. Got a rep who said she couldn't help with pricing, transferred me to retention. Waited on hold for another 23 minutes. Retention rep said the best they could do was $110/month. I said that's still too high. He said "that's the best I can do" and hung up on me. Call #2: Called back, waited 52 minutes. Got a different retention rep who offered me $95/month if I signed a new 2-year contract. I said I'd think about it. He said "this offer expires today" which I knew was a pressure tactic. I declined. He got rude and said "well then you'll pay full price" and hung up. Call #3: Called again a week later, waited 38 minutes. This time I got a rep who said she could offer me $85/month. I asked why this was different from the previous offers. She said "I don't know what the previous reps told you." I accepted the $85 offer. She said she'd send me a confirmation email. Never received it. Next bill came - still $130. Call #4: Called to ask why the rate wasn't changed. Waited 41 minutes. Rep said there's no record of the $85 offer in my account. I explained the previous call. She said "I can't verify that, but I can offer you $100/month." I said I was told $85. She said "I can only offer $100." I asked to speak to a supervisor. She said "supervisors don't take calls, but one will call you back within 24-48 hours." No callback. Call #5: Called again after another week, waited 55 minutes. Got a rep who said he could see notes about previous calls but couldn't honor the $85 offer because "that rep wasn't authorized to make that offer." I asked what he could do. He said $100/month. I said fine, just fix it. He said he'd process it and I'd see it on my next bill. Next bill - still $130. Call #6: I'm now extremely frustrated. Called, waited 48 minutes, demanded to speak to a supervisor immediately. Rep said that's not possible. I asked for her supervisor's name and direct number. She refused. I asked for her name and employee ID. She gave me a fake-sounding name and said she doesn't have an employee ID. I hung up. Call #7: Called the next day, waited 62 minutes (longest wait yet). Got a rep who seemed more helpful. I explained the entire situation. She said she was very sorry and would definitely fix this. She said she'd credit my account $90 for the overcharges and set my rate to $85/month going forward. She gave me a confirmation number. I asked for it in writing. She said she'd email me. Never received email. Next bill - still $130, no credit. Call #8: I'm now considering legal action. Called, waited 51 minutes. Got a rep who said "I see you've called many times about this issue." I said yes, and it's still not fixed. She said "let me transfer you to our executive resolution team." I got transferred, waited another 28 minutes. Executive resolution rep said he'd look into it and call me back within 24 hours. No callback. Call #9: I filed a complaint with the BBB. Called Frontier one more time to give them a chance to fix it before the BBB complaint. Waited 44 minutes. Got a rep who said "I see you have a BBB complaint." I said yes, because you won't fix my billing issue. She said "I can't help you while there's an active BBB complaint, you need to work through BBB." I hung up. It's now been 3 months, 9 phone calls, over 15 hours of my time, and the problem still isn't fixed. I'm paying $130/month when I should be paying $85. I've wasted countless hours on hold. I've been lied to, hung up on, transferred endlessly, and given the runaround. This is the worst customer service experience of my life. Frontier's customer service is completely broken. They don't train their reps properly, they don't give them authority to actually solve problems, they don't follow through on promises, and they don't care about customers. If you value your time and sanity, avoid Frontier at all costs.""",
]

# PROBLEM 4: INSTALLATION & SETUP PROBLEMS
INSTALLATION_REVIEWS = [
    # Short reviews
    "Installation scheduled 3 times. Tech never showed up twice. Third time he was 4 hours late. Unprofessional.",
    "Tech left cables running across my living room ceiling. Refused to run them through walls. Said it costs extra. Lazy installation.",
    "Installation took 6 hours and still doesn't work properly. Had to schedule 2 more visits to fix it. Terrible experience.",
    "Tech showed up without proper equipment. Had to reschedule. Wasted my entire day waiting for nothing.",
    
    # Medium reviews
    """The installation process was a complete nightmare. I scheduled installation for a Tuesday between 8am-12pm. I took the day off work. 12pm comes, no technician. I call Frontier - they say the technician is running late and will be there by 2pm. 2pm comes, still no technician. I call again - they say the technician had an emergency and can't make it. They reschedule me for Thursday. I take another day off work. Thursday, 8am-12pm window, no technician again. I call - they say the technician will be there by 4pm. 4pm comes, still nothing. I call again, they say the appointment was cancelled (by who? Not me!). They reschedule for the following Monday. Third time, I take another day off. Monday, technician finally shows up at 11am (within the window, finally!). But he doesn't have the right equipment. He says he needs a different type of fiber connector. He leaves to get it, comes back 2 hours later. Installation finally starts at 1pm. It takes 5 hours. The technician is clearly inexperienced - he's calling his supervisor multiple times asking how to do things. He runs the fiber cable in the ugliest way possible - across my front yard, up the side of my house, through a window (not even drilling a proper hole), and across my living room ceiling. I ask if he can run it through the walls or at least hide it better. He says "that's not included in standard installation, that costs extra." I'm paying for professional installation and this is what I get? The installation is finally done at 6pm. He tests it and says "it should work." I test it - speeds are terrible, connection drops constantly. I call support, they schedule another technician visit. This has been going on for 3 weeks and I still don't have working internet. I've wasted 3 vacation days. This is unacceptable.""",
    
    """Installation was supposed to be simple - I already had fiber infrastructure in my neighborhood, they just needed to connect it to my house. The technician showed up on time, which was good. But then things went downhill. He spent 2 hours trying to find where the fiber line comes into my property. He kept calling his supervisor asking where to look. Finally found it. Then he spent another hour trying to figure out how to connect it. He was clearly not trained properly. He finally got it connected, but the way he did it was terrible - he left a huge mess of cables and equipment in my garage, didn't clean up after himself, and didn't explain anything to me. He just said "you're all set" and left. I tried to use the internet - it didn't work. I called support, they said the installation wasn't completed properly in their system. They scheduled another technician. Second technician came, spent 3 hours fixing what the first one did wrong. Still didn't work properly. Third technician visit, finally got it working. But the installation looks terrible and unprofessional. I'm embarrassed to have people over because of how messy the setup looks. For a company that charges for "professional installation," this was anything but professional.""",
    
    # Long detailed reviews
    """I want to warn everyone about Frontier's installation process. It was the worst experience I've ever had with any service provider. Here's the complete timeline: Week 1, Monday: I call to sign up for Frontier Fiber. Sales rep is great, answers all my questions, schedules installation for Friday 8am-12pm. I take Friday off work. Week 1, Friday: I wait all morning. 12pm comes, no technician. I call Frontier - they say the technician is running 30 minutes late. 1pm, still no technician. I call again - they say the technician will be there by 2pm. 2pm, nothing. I call again - they say the appointment was "missed" and they need to reschedule. I'm frustrated but agree to reschedule for the following Tuesday. Week 2, Tuesday: I take another day off work. 8am-12pm window, no technician again. I call - they say the technician had a flat tire and can't make it. They reschedule for Thursday. Week 2, Thursday: Third day off work. Technician finally shows up at 10:30am. But he's clearly in a hurry and doesn't have all his equipment. He starts the installation but realizes he needs a different tool. He leaves to get it, comes back 2 hours later. Installation finally starts at 1pm. The technician is young and inexperienced. He's on the phone with his supervisor constantly asking how to do basic things. He runs the fiber cable in the most unprofessional way possible: Instead of burying it or running it along the house neatly, he runs it across my front lawn (where I'll mow over it), up the side of my house with zip ties every 2 feet (looks terrible), and then instead of drilling a proper hole, he runs it through an open window and tells me "you can just leave this window open or cut a hole in the screen." Are you kidding me? I ask if he can do a proper installation - bury the cable or at least run it neatly along the house and drill a proper hole. He says "standard installation doesn't include that, you'd need to pay for a custom installation which is $200 extra." I'm already paying for installation and this is what I get? The installation takes 6 hours total. He's working until 7pm. He's clearly rushing and making mistakes. He finally finishes and says "you're all set." I test the internet - it doesn't work. He runs some tests and says "there might be an issue with the line, I'll need to come back." He leaves. I call support - they schedule another technician for the following week. Week 3, Monday: Fourth day off work. Second technician comes. He looks at what the first technician did and says "this is all wrong." He spends 4 hours redoing everything. He's more professional and actually knows what he's doing. He properly runs the cable, drills a proper hole, cleans up after himself. But when he tests it, there's still an issue - the speeds are way below what I'm paying for. He says there might be an issue with the fiber line itself and he needs to escalate to network engineering. Week 4: I still don't have working internet. I call support multiple times. They keep saying "we're working on it." Finally, a third technician comes. He's a senior technician and actually knows what he's doing. He finds the real problem - the first technician connected things incorrectly and damaged some equipment. He fixes it properly. Internet finally works. But the installation still looks terrible because of what the first technician did. I've now wasted 4 vacation days, had 3 technician visits, and the installation looks unprofessional. I call Frontier to complain and ask for a credit for my time and the poor installation quality. They offer me $50 credit (not even enough to cover one day of lost wages). I ask to speak to a supervisor - they say one will call me back. No callback. This installation process was a complete disaster. If you're considering Frontier, be prepared for multiple visits, unprofessional technicians, and a lot of wasted time.""",
]

# PROBLEM 5: EQUIPMENT QUALITY ISSUES
EQUIPMENT_REVIEWS = [
    # Short reviews
    "Router they provided is garbage. WiFi barely reaches my bedroom. Had to buy my own $200 router. Waste of money.",
    "Equipment fails constantly. Router has been replaced 3 times in 6 months. Clearly using cheap, unreliable hardware.",
    "WiFi range is terrible. Can't get signal in half my house. Tech said 'that's normal' and refused to help.",
    "Outdated equipment. Router doesn't support modern WiFi standards. Slow speeds because of their cheap hardware.",
    
    # Medium reviews
    """The equipment Frontier provided is absolutely terrible. They gave me a router that looks like it's from 2015. The WiFi range is pathetic - I can barely get a signal in my bedroom, which is only 30 feet from the router. My house is 1800 square feet, which is not huge, but their router can't even cover it. I've tried moving the router to different locations, but it doesn't help. I called support and asked if they could provide a better router or WiFi extenders. They said "the router we provide is sufficient for most homes." I said it's not sufficient for mine. They said I could rent WiFi extenders for $10/month each. So I'm supposed to pay extra for equipment that should work in the first place? I ended up buying my own router for $180. Now my WiFi works great, but I'm still paying Frontier $12/month for their useless router that's sitting in a closet. When I called to return it and stop the rental fee, they said "you need to keep our router for the service to work." That's not true - I'm using my own router and it works fine. They're just trying to keep charging me for equipment I don't need. This is a scam.""",
    
    """I've had Frontier for 8 months and the equipment has been nothing but problems. The router they provided failed after 2 months - it just stopped working completely. I called support, they sent a replacement. The replacement failed after 3 months - this time it would randomly reboot every few hours, dropping my internet connection. They sent another replacement. That one lasted 1 month before the WiFi stopped working (ethernet still worked, but no WiFi). They sent a fourth router. This one seems to be working, but the WiFi range is terrible and the speeds are slow. I've had 4 routers in 8 months. That's clearly a quality problem. I asked if they could provide a different model or brand of router, and they said "we only provide one model." So I'm stuck with their cheap, unreliable equipment. I'm paying $12/month to rent this garbage. I should just buy my own router, but I'm already paying for theirs. This is frustrating and expensive.""",
    
    # Long detailed reviews
    """I need to warn people about Frontier's equipment quality. It's absolutely terrible and they'll try to charge you extra for equipment that should work in the first place. When I signed up for Frontier Fiber, they provided a router as part of the service. I was told it was "included" but later found out I'm paying $12/month to rent it. The router they gave me is a basic model that's clearly outdated. It doesn't support the latest WiFi standards (WiFi 6), so even though I'm paying for 500 Mbps fiber, my WiFi speeds are limited by the router's capabilities. But the bigger problem is the WiFi range. My house is 2000 square feet, which is average size. The router is centrally located in my living room. Yet I can barely get a WiFi signal in my master bedroom, which is only 40 feet away. My kids' rooms upstairs get almost no signal at all. I've tried everything - moving the router to different locations, adjusting settings, updating firmware. Nothing helps. The router's range is just terrible. I called Frontier support and explained the problem. They said "WiFi range can vary based on your home's construction." I said my previous ISP's router worked fine in the same house. They said "you can rent WiFi extenders for $10/month each." So their solution is to charge me even more money for equipment to fix a problem with the equipment they're already charging me for? That's ridiculous. I asked if they could provide a better router with better range. They said "the router we provide meets our specifications." I asked what those specifications are. They couldn't tell me. I ended up buying my own high-quality router for $220. Now my WiFi works perfectly throughout my entire house, and I'm getting the full speeds I'm paying for. But I'm still paying Frontier $12/month for their useless router. When I called to return it and cancel the rental fee, they gave me the runaround. First they said I need to keep their router for the service to work (not true - I'm using my own router and it works fine). Then they said I can return it but there's a $50 restocking fee. Then they said the router is required for their "managed WiFi service" (I don't need managed WiFi, I just need internet). After 3 phone calls and 2 hours of my time, they finally agreed to let me return it, but I had to pay to ship it back to them. So I'm paying to return equipment I don't want and never should have been charged for in the first place. This is a scam. They provide cheap, low-quality equipment, charge you monthly for it, and then try to charge you even more for equipment to fix the problems with their cheap equipment. If you sign up for Frontier, just plan on buying your own router from day one. Don't waste your time and money on their garbage equipment.""",
]

# PROBLEM 6: CANCELLATION & CONTRACT NIGHTMARES
CANCELLATION_REVIEWS = [
    # Short reviews
    "Cancelled service 4 months ago. Still being charged every month. Called 6 times, still not fixed. This is fraud.",
    "Tried to cancel. They said I need to pay $350 early termination fee. Contract says $200. They're making up numbers.",
    "Cancellation process is impossible. Transferred 8 times, on hold for 2 hours, still couldn't cancel. Had to file BBB complaint.",
    "Cancelled properly, returned equipment, got confirmation. 3 months later they sent me to collections. Ruined my credit.",
    
    # Medium reviews
    """I cancelled my Frontier service 3 months ago because I was moving to a different state. I followed their cancellation process exactly: Called their cancellation line, spoke to a retention specialist (who tried to keep me as a customer), declined their offers, got a confirmation number, returned their equipment to an authorized UPS location with a receipt. Everything by the book. Or so I thought. Month 1 after cancellation: I'm still being charged $85 on my credit card. I call Frontier - they say "there's a delay in processing cancellations, it will be credited next month." Month 2: Another $85 charge. I call again - they say my account shows as cancelled but there's a "billing system delay." They promise to credit both months. Month 3: Another $85 charge, and no credits have appeared. I call again, this time demanding to speak to a supervisor. After 45 minutes on hold, I get a supervisor who says "I see the issue, let me fix this right now." She says she'll credit all 3 months and ensure no more charges. She gives me a confirmation number. Month 4: Another $85 charge. I'm now out $340 for service I haven't had for 4 months. I call again, absolutely furious. They transfer me to their "executive resolution team." The executive resolution rep says "I see you cancelled properly, but our billing system didn't process it correctly. I'll fix this immediately." He says he'll credit all charges and send me a confirmation email. I never receive the email. Month 5: Another charge. I've now had enough. I've initiated chargebacks with my credit card company, filed complaints with the BBB and FCC, and contacted my state's Attorney General. This is fraud. They're charging me for services I don't have and can't use. And now they have the audacity to send my account to collections for "unpaid balances" - balances I don't owe! This is affecting my credit score. I've kept meticulous records of every call, every confirmation number, the equipment return receipt. I'm considering legal action. If you ever need to cancel Frontier, be prepared for a nightmare.""",
    
    """I tried to cancel my Frontier service last month. My contract was up, so there should be no early termination fee. I called their cancellation number. Here's what happened: Call #1: Waited on hold for 38 minutes. Got a retention specialist who tried to convince me to stay. I declined. She said she'd process my cancellation and I'd receive a confirmation email. Never received it. Call #2: Called back a week later to confirm cancellation. Waited 42 minutes. Rep said my account doesn't show as cancelled. I explained the previous call. She said "I don't see that in the system, let me transfer you to cancellations." Got transferred, waited another 28 minutes. Cancellations rep said "I can process your cancellation, but there's a $250 early termination fee." I said my contract is up, there should be no fee. He said "let me check... actually, there's a $350 fee." I said that's even worse, and my contract is definitely up. He said "I need to transfer you to the contracts department to verify." Got transferred, waited 22 minutes. Contracts rep said "your contract ended 2 months ago, there's no termination fee." She transferred me back to cancellations. Got transferred, waited 18 minutes. New cancellations rep said "I can cancel you, but you need to return equipment first." I said I'll return it after you process the cancellation. He said "we can't process cancellation until equipment is returned." I said that doesn't make sense. He transferred me to equipment returns. Waited 15 minutes. Equipment returns rep gave me a return label and said to return equipment, then call back to cancel. I returned the equipment the next day with tracking. Called back to cancel. Waited 35 minutes. Rep said "I see you returned equipment, but I need to verify it was received before I can cancel." I said the tracking shows it was delivered. He said "we need 5-7 business days to process returns." I waited a week, called back. Waited 41 minutes. Rep said "equipment was received, I can now process your cancellation." Finally! But then he said "there's a $200 early termination fee." I said my contract is up, there's no fee. He said "let me check... actually you're right, no fee. I'll process the cancellation now." He gave me a confirmation number. I asked for it in writing. He said he'd email me. Never received email. Next month, I'm still being charged. I call again. They say my account shows as "pending cancellation" but it's not fully processed. This has been going on for 6 weeks. I still haven't successfully cancelled. This process is designed to be impossible. They make it so difficult and frustrating that people give up and keep paying. This is predatory.""",
    
    # Long detailed reviews
    """I need to share my absolutely horrific experience trying to cancel Frontier service. This is a warning to anyone who signs up - cancelling is nearly impossible and they will continue charging you even after you've properly cancelled. Here's my complete nightmare timeline: Month 1: I decide to cancel Frontier because I'm moving and there are better options in my new area. My 2-year contract ended 3 months ago, so there should be no early termination fee. I call Frontier's cancellation number. After 47 minutes on hold, I get a retention specialist. She tries very hard to keep me - offers me a lower rate, free equipment upgrade, etc. I decline. She says "I understand, let me process your cancellation." She gives me a confirmation number: CAN-123456. She says I'll receive a confirmation email within 24 hours and my service will be disconnected in 7-10 business days. She also says I need to return their equipment within 30 days or I'll be charged for it. I ask if I can return it now. She says "you can return it anytime before disconnection, but you need to keep it until then for your service to work." That makes sense. I never receive the confirmation email. Week 2: I still have service, which is fine since they said 7-10 business days. But I'm getting nervous because I never got the email. I call to confirm my cancellation is being processed. After 52 minutes on hold, I get a rep who says "I don't see a cancellation request in your account." I give her the confirmation number. She says "that confirmation number doesn't exist in our system." I'm confused. I explain the previous call. She says "let me transfer you to cancellations to see what's going on." I get transferred, wait another 31 minutes. Cancellations rep says "I see notes about a cancellation request, but it was never fully processed. Let me process it now." She gives me a new confirmation number: CAN-789012. She says I'll receive an email and service will be disconnected in 7-10 business days. Week 3: Still no email, still have service. I call again. After 38 minutes, rep says "your cancellation is pending, it takes time to process." I ask why I never got an email. She says "sometimes emails don't send, but your cancellation is being processed." Week 4: Still have service. I call again. After 44 minutes, rep says "I see your cancellation request, but you need to return equipment first before we can process it." I say the previous rep said I could return it after disconnection. This rep says "that's incorrect, you need to return it first." I'm frustrated but agree. She emails me a return label. I package up the equipment and return it via UPS with tracking. Week 5: Tracking shows equipment was delivered. I call to confirm they received it and to finalize my cancellation. After 41 minutes, rep says "we need 5-7 business days to process equipment returns before we can process cancellation." I wait. Week 6: I call again. After 39 minutes, rep says "equipment was received and processed. I can now finalize your cancellation." Finally! But then she says "there's a $300 early termination fee." I say my contract ended 4 months ago, there's no fee. She says "let me check your contract... actually, you're right, no fee. I'll process the cancellation now." She gives me confirmation number CAN-345678. She says I'll receive an email and my final bill. Month 2: I've moved to my new home. I check my credit card - Frontier charged me $85. I'm furious. I call them. After 51 minutes, rep says "your account shows as cancelled, but there was a billing cycle delay. You'll be credited on your next bill." I say there shouldn't be a next bill, I'm cancelled. She says "the credit will be processed separately." Month 3: Another $85 charge. I call again, absolutely livid. After 58 minutes (longest wait yet), I get a supervisor. I explain everything. She says "I see the issue. Your cancellation was processed, but our billing system didn't stop the charges. This is a known system issue. I'll credit both months immediately." She gives me a confirmation number and says I'll receive an email. I never receive the email. Month 4: Another $85 charge. I'm now out $255 for service I haven't had for 3 months. I call again. After 43 minutes, I demand to speak to someone who can actually fix this. I get transferred to "executive resolution." Wait another 27 minutes. Executive resolution rep says "I'm very sorry for this issue. I can see you cancelled properly and returned equipment. This is clearly a billing system error. I'll credit all charges immediately and ensure no more charges occur." He gives me yet another confirmation number and promises an email. Month 5: Another $85 charge. I've now had enough. I've spent over 10 hours on the phone, been given 5 different confirmation numbers, and I'm still being charged. I initiate a chargeback with my credit card company for all the fraudulent charges. I file complaints with the Better Business Bureau, the FCC, and my state's Attorney General. I document everything - every call, every confirmation number, the equipment return receipt with tracking. Month 6: I get a letter from a collections agency saying I owe Frontier $425 for "unpaid service charges." This is insane. I don't owe them anything - I cancelled properly, returned equipment, and they kept charging me for service I don't have. This is now affecting my credit score. I call Frontier one more time, absolutely furious. After 62 minutes, I get someone in their "collections resolution department." I explain that I'm being sent to collections for charges I don't owe. They say "I see the issue, let me fix this." They say they'll remove the collections notice and credit all charges. They give me confirmation number CAN-999999. I ask for this in writing. They say they'll send a letter. I never receive it. It's now been 6 months since I tried to cancel. I'm still being charged (though my credit card company is fighting the charges). My credit score has dropped 40 points because of the collections notice. I've wasted countless hours. I'm considering legal action. This cancellation process is clearly designed to be impossible. They make it so difficult and frustrating that people either give up and keep paying, or they continue charging you even after you've properly cancelled. This is fraud. If you're considering Frontier, know that cancelling will be a nightmare. And if you do cancel, monitor your credit card and credit report closely, because they will likely continue charging you.""",
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
                   "Paul", "Maria", "Andrew", "Susan", "Brian", "Angela", "Kevin", "Patricia",
                   "Ryan", "Stephanie", "Jason", "Rebecca", "Eric", "Laura", "Jacob", "Sharon",
                   "Gary", "Cynthia", "Nicholas", "Kathleen", "Jonathan", "Amy", "Stephen", "Anna"]
    last_initials = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "W", "Y", "Z"]
    
    if random.random() < 0.25:  # 25% anonymous
        return f"User{random.randint(1000, 9999)}"
    else:
        return f"{random.choice(first_names)} {random.choice(last_initials)}."

def enhance_review_text(review_text, problem_category):
    """Enhance review text with LLM-extractable attributes"""
    
    # Generate metadata
    tenure_months = random.randint(3, 24)
    problem_duration_weeks = random.randint(1, 12)
    contract_end_months = random.randint(0, 12) if random.random() < 0.7 else None
    
    # Use cases
    use_cases = [
        "Work from home full-time (mission critical)",
        "Work from home part-time (important)",
        "Gaming and streaming (moderate)",
        "General internet use (casual)",
        "Small business owner (mission critical)",
        "Student (moderate)",
        "Remote work requiring video calls (mission critical)"
    ]
    use_case = random.choice(use_cases)
    
    # Competitors
    competitors = ["Spectrum", "AT&T", "Xfinity", "Comcast", "Cox", "Verizon"]
    competitor = random.choice(competitors) if random.random() < 0.6 else None
    
    # Churn indicators
    churn_risk = random.choice(["high", "medium", "high", "critical"])
    switching_intent = random.choice([
        "Actively looking for alternatives",
        "Will switch when contract ends",
        "Considering switching",
        "Definitely switching"
    ])
    
    # Resolution status
    resolution_status = random.choice([
        "Issue remains unresolved",
        "Problem unresolved after multiple attempts",
        "Still waiting for resolution",
        "No resolution despite multiple contacts"
    ])
    
    # Problem category labels
    category_labels = {
        "billing": "Billing Issue (Primary)",
        "network": "Network Performance Issue (Primary)",
        "customer_service": "Customer Service Issue (Primary)",
        "installation": "Installation Issue (Primary)",
        "equipment": "Equipment Issue (Primary)",
        "cancellation": "Cancellation Issue (Primary)"
    }
    
    # Build enhanced review
    enhanced_parts = []
    
    # Add problem category label and customer tenure
    enhanced_parts.append(f"{category_labels.get(problem_category, 'Service Issue (Primary)')} - Customer for {tenure_months} months:")
    
    # Add original review text
    enhanced_parts.append(review_text)
    
    # Add use case if not already mentioned
    if "work from home" not in review_text.lower() and "work" in use_case.lower():
        enhanced_parts.append(f"Use Case: {use_case}.")
    
    # Add resolution status if not already clear
    if "unresolved" not in review_text.lower() and "resolved" not in review_text.lower():
        enhanced_parts.append(f"Resolution Status: {resolution_status}.")
    
    # Add churn indicators
    churn_parts = []
    if competitor:
        if contract_end_months:
            churn_parts.append(f"Churn Risk: {churn_risk.capitalize()} - {switching_intent}. Will switch to {competitor} when contract ends in {contract_end_months} months.")
        else:
            churn_parts.append(f"Churn Risk: {churn_risk.capitalize()} - {switching_intent}. Considering {competitor} as alternative.")
    else:
        churn_parts.append(f"Churn Risk: {churn_risk.capitalize()} - {switching_intent}.")
    
    enhanced_parts.extend(churn_parts)
    
    return " ".join(enhanced_parts)

def generate_review(problem_category, platform):
    """Generate a problem-focused review"""
    
    # Select review template based on problem category
    if problem_category == "billing":
        templates = BILLING_REVIEWS
        titles = [
            "Billing Nightmare", "Hidden Fees Everywhere", "Price Doubled After Promo",
            "Billed for Service I Don't Have", "Fraudulent Billing Practices",
            "Promised Credits Never Appear", "Deceptive Pricing"
        ]
        rating = random.choice([1, 1, 1, 2])
    elif problem_category == "network":
        templates = NETWORK_REVIEWS
        titles = [
            "False Advertising - Speeds Not as Promised", "Constant Outages",
            "Area is Oversold", "Unusable During Peak Hours", "Network Performance Terrible",
            "Speeds Drop to Nothing", "Infrastructure Can't Support Customers"
        ]
        rating = random.choice([1, 1, 2, 2])
    elif problem_category == "customer_service":
        templates = CUSTOMER_SERVICE_REVIEWS
        titles = [
            "Horrible Customer Service", "Worst Support Ever", "Support Refuses to Help",
            "Still Waiting for Resolution", "Hours on Hold, No Help", "Broken Callback Promises",
            "Customer Service is a Joke"
        ]
        rating = random.choice([1, 1, 2])
    elif problem_category == "installation":
        templates = INSTALLATION_REVIEWS
        titles = [
            "Unprofessional Installation", "Installation Took 3 Visits",
            "Technician Never Showed", "Terrible Installation Experience",
            "Wasted Multiple Days", "Installation Still Doesn't Work"
        ]
        rating = random.choice([1, 1, 2, 2])
    elif problem_category == "equipment":
        templates = EQUIPMENT_REVIEWS
        titles = [
            "Equipment Issues Non-Stop", "Cheap, Unreliable Equipment",
            "Router is Garbage", "WiFi Range is Terrible", "Equipment Fails Constantly",
            "Forced to Buy Own Equipment"
        ]
        rating = random.choice([1, 2, 2, 3])
    else:  # cancellation
        templates = CANCELLATION_REVIEWS
        titles = [
            "Cancellation Process is Impossible", "Still Being Charged After Cancellation",
            "Sent to Collections for No Reason", "Can't Cancel Service", "Cancellation Nightmare",
            "Fraudulent Charges After Cancellation"
        ]
        rating = random.choice([1, 1, 1, 2])
    
    # Select template
    review_text = random.choice(templates)
    
    # Enhance review text with LLM-extractable attributes
    review_text = enhance_review_text(review_text, problem_category)
    
    # Location
    area_choice = random.choices(["urban", "suburban", "rural"], weights=[50, 35, 15])[0]
    location = random.choice(LOCATIONS[area_choice])
    
    # Date
    date_obj = random_date_last_18_months()
    date_str = format_date_for_platform(date_obj, platform)
    
    # Build review object (same structure as platform_authentic, but with enhanced review_text)
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
        # More helpful votes for longer, detailed reviews
        max_helpful = 50 if len(review_text.split()) > 200 else 25
        review["helpful_count"] = random.randint(0, max_helpful)
    
    # Add platform-specific verification field
    if config["verified_field"]:
        review[config["verified_field"]] = random.random() < 0.70  # 70% verified
    
    # Add review URL
    review["review_url"] = f"https://example.com/reviews/{platform.lower().replace(' ', '')}/{random.randint(100000, 999999)}"
    
    return review

def generate_all_reviews(total=5000):
    """Generate all reviews with balanced distribution across problems and platforms"""
    
    reviews = []
    platforms = list(PLATFORM_CONFIGS.keys())
    problems = ["billing", "network", "customer_service", "installation", "equipment", "cancellation"]
    
    # Distribute reviews: ~833 per problem (5000 / 6)
    reviews_per_problem = total // len(problems)
    reviews_per_problem_per_platform = reviews_per_problem // len(platforms)
    
    print(f"\nGenerating {total} problem-focused reviews...")
    print(f"Problems: {len(problems)}")
    print(f"Platforms: {len(platforms)}")
    print(f"Per problem: {reviews_per_problem}")
    print(f"Per problem per platform: {reviews_per_problem_per_platform}\n")
    
    for problem in problems:
        print(f"Generating {problem} reviews...")
        for platform in platforms:
            for _ in range(reviews_per_problem_per_platform):
                reviews.append(generate_review(problem, platform))
    
    # Add some extra reviews to reach exactly 5000
    remaining = total - len(reviews)
    if remaining > 0:
        print(f"Adding {remaining} additional reviews to reach {total}...")
        for _ in range(remaining):
            problem = random.choice(problems)
            platform = random.choice(platforms)
            reviews.append(generate_review(problem, platform))
    
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
        "problem_categories": {
            "billing": 0,
            "network": 0,
            "customer_service": 0,
            "installation": 0,
            "equipment": 0,
            "cancellation": 0
        },
        "word_count_stats": {
            "min": 0,
            "max": 0,
            "average": 0
        }
    }
    
    word_counts = []
    problem_keywords = {
        "billing": ["bill", "fee", "price", "charge", "billing", "promo", "promotional"],
        "network": ["speed", "mbps", "outage", "oversold", "slow", "drop", "disconnect"],
        "customer_service": ["support", "service", "call", "hold", "rep", "supervisor", "callback"],
        "installation": ["install", "technician", "tech", "setup", "visit", "cable"],
        "equipment": ["router", "equipment", "wifi", "hardware", "device"],
        "cancellation": ["cancel", "cancellation", "termination", "contract", "collections"]
    }
    
    for review in reviews:
        stats["platform_distribution"][review["platform"]] += 1
        stats["rating_distribution"][review["rating"]] += 1
        
        # Categorize by keywords
        text_lower = review["review_text"].lower()
        for problem, keywords in problem_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                stats["problem_categories"][problem] += 1
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
    print("PROBLEM-FOCUSED REVIEW GENERATOR")
    print("Generating 5000 reviews showcasing 6 critical problems")
    print("=" * 70)
    
    # Generate reviews
    reviews = generate_all_reviews(5000)
    
    # Generate statistics
    stats = generate_statistics(reviews)
    
    # Save reviews
    output_file = "frontier_reviews_5000_problem_focused.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(reviews, f, indent=2, ensure_ascii=False)
    
    # Save statistics
    stats_file = "problem_focused_review_statistics.json"
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
    
    print("\nPROBLEM CATEGORY DISTRIBUTION:")
    for problem, count in sorted(stats["problem_categories"].items()):
        percentage = (count / len(reviews)) * 100
        print(f"   {problem:20s}: {count:4d} ({percentage:5.1f}%)")
    
    print(f"\n{'=' * 70}")
    print("Problem-focused reviews ready for analysis!")
    print(f"{'=' * 70}\n")

