export const hostels = [
    {
        id: 1,
        name: "Shree Siddhivinayak ",
        location: "Pune, Maharashtra",
        description: "A safe and secure hostel for girls for the oast 24years.",
        price: 10000,
        rating: 4.8,
        amenities: ["WiFi", "AC", "Common Room", "Cafe", "Lockers"],
        images: ["/bed-types/single-study.svg", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
        type: "Living",
        gender: "Girls",
        messAvailable: false
    },
    {
        id: 2,
        name: "Friends",
        location: "Pune, Maharashtra",
        description: "Affordable student accommodation near PICT and Bharati Vidyapeeth University. Quiet study zones and high-speed internet.",
        price: 10500,
        rating: 4.5,
        amenities: ["Study Room", "WiFi", "Laundry", "Mess", "24/7 Security"],
        images: ["/bed-types/twin-share.svg", "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
        type: "Student",
        gender: "Girls",
        messAvailable: false
    },
    {
        id: 3,
        name: "Shivraj",
        location: "Pune, Maharashtra",
        description: "Flats whic offer comfort ans safety like home",
        price: 8000,
        rating: 4.2,
        amenities: ["Fridge", "AC", "Kitchen", "INduction", "Washing machine"],
        images: ["/bed-types/bunk-bed.svg", "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?auto=format&fit=crop&w=800&q=80"],
        type: "Living",
        gender: "Girls",
        messAvailable: false
    }
];

export const reviews = [];

export const stories = [
    {
        userName: "Ananya K.",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        hostelName: "Zostel Mumbai",
        content: "Met the most amazing people here! The rooftop sessions and cafe vibes are unmatched. Perfect for solo travelers! 🌟",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80",
        category: "Experience"
    },
    {
        userName: "Rahul M.",
        userAvatar: "https://i.pravatar.cc/150?img=12",
        hostelName: "Campus Hive Girl's Hostel",
        content: "Super safe and clean! The biometric entry gave my parents peace of mind. Study room is a lifesaver during exams.",
        image: "https://images.unsplash.com/photo-1522771753037-6333616235df?auto=format&fit=crop&w=400&q=80",
        category: "Review"
    },
    {
        userName: "Priya S.",
        userAvatar: "https://i.pravatar.cc/150?img=9",
        hostelName: "Goa Beach Hostel",
        content: "Pro tip: Book the sunset yoga sessions! Also, try the local fish curry at the beach shack next door. Absolute bliss! 🧘‍♀️",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
        category: "Tip"
    },
    {
        userName: "Arjun P.",
        userAvatar: "https://i.pravatar.cc/150?img=15",
        hostelName: "Himalayan Basecamp",
        content: "Worked remotely from here for a month. The co-working space with mountain views is incredible. WiFi is solid!",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80",
        category: "Experience"
    },
    {
        userName: "Sneha R.",
        userAvatar: "https://i.pravatar.cc/150?img=20",
        hostelName: "Pink City Backpackers",
        content: "The cultural tours organized by the hostel are fantastic! Don't miss the rooftop chai sessions at sunset. 🌅",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
        category: "Tip"
    },
    {
        userName: "Karan L.",
        userAvatar: "https://i.pravatar.cc/150?img=8",
        hostelName: "Student Pods Andheri",
        content: "The mess food is actually good! Plus the 24/7 security and study zones make it ideal for late-night cramming.",
        image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80",
        category: "Review"
    },
    {
        userName: "Maya D.",
        userAvatar: "https://i.pravatar.cc/150?img=25",
        hostelName: "Kerala Backwaters Hostel",
        content: "Canoeing through the backwaters at sunrise is magical. The hammocks and sunset views are perfect for digital detox! 🛶",
        image: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=400&q=80",
        category: "Experience"
    },
    {
        userName: "Vikram J.",
        userAvatar: "https://i.pravatar.cc/150?img=13",
        hostelName: "TechHub Stay",
        content: "Great value for money! Close to all the tech parks in Hitech City. The mess serves unlimited meals which is a huge plus.",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80",
        category: "Review"
    }
];

export const communities = [
    {
        name: "Solo Female Travelers",
        description: "A safe space for women traveling alone. Share tips, find travel buddies, and support each other!",
        memberCount: 2847,
        category: "Travel",
        icon: "👩‍🦰"
    },
    {
        name: "Digital Nomads India",
        description: "Remote workers exploring India. Discuss best coworking spaces, internet connectivity, and work-life balance.",
        memberCount: 1523,
        category: "Remote Work",
        icon: "💻"
    },
    {
        name: "Budget Backpackers",
        description: "Travel India on a shoestring! Share budget hacks, cheap eats, and affordable stays.",
        memberCount: 4192,
        category: "Travel",
        icon: "🎒"
    },
    {
        name: "College Students Network",
        description: "For students looking for affordable PGs and hostels near universities. Share reviews and recommendations!",
        memberCount: 3654,
        category: "Students",
        icon: "🎓"
    },
    {
        name: "Adventure Seekers",
        description: "For thrill-seekers and adrenaline junkies. Plan treks, water sports, and adventure activities together!",
        memberCount: 1876,
        category: "Adventure",
        icon: "🏔️"
    },
    {
        name: "Foodie Travelers",
        description: "Discover local cuisines, street food gems, and authentic dining experiences across India.",
        memberCount: 2931,
        category: "Travel",
        icon: "🍛"
    }
];
