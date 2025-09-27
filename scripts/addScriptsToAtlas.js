const mongoose = require('mongoose');
const Script = require('../models/Script');
const Admin = require('../models/Admin');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shyness-app');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const addScriptsToAtlas = async () => {
  await connectDB();

  try {
    // Get admin user or create a default one
    let admin = await Admin.findOne({ role: 'super-admin' });
    if (!admin) {
      console.log('⚠️ No admin user found. Creating default admin...');
      admin = await Admin.create({
        name: 'System Admin',
        email: 'admin@shynessapp.com',
        password: 'admin123',
        role: 'super-admin'
      });
      console.log('✅ Default admin created');
    }

    const scripts = [
      // Professional Category
      {
        title: 'Job Interview Success',
        category: 'professional',
        topic: 'How to ace your job interview',
        description: 'Complete guide to preparing for and succeeding in job interviews',
        content: `# Job Interview Success Script

## Introduction (30 seconds)
"Good morning/afternoon, I'm excited to be here today. I've been following your company's work in [specific area] and I'm particularly impressed by [specific achievement]. I believe my background in [relevant experience] aligns well with what you're looking for."

## Professional Background (2 minutes)
"Let me tell you about my professional journey. I started my career in [field] where I [specific achievement]. This experience taught me [key skill]. In my current role at [company], I've been responsible for [specific responsibilities] and have achieved [quantifiable results]."

## Key Strengths (1 minute)
"I'd like to highlight three key strengths that make me a strong candidate:
1. [Strength 1] - demonstrated by [specific example]
2. [Strength 2] - shown through [specific achievement]
3. [Strength 3] - evidenced by [specific result]"

## Questions for the Interviewer (1 minute)
"I have a few questions about the role and company culture:
- What does success look like in this position?
- What are the biggest challenges facing the team?
- How do you see this role evolving in the next year?"

## Closing (30 seconds)
"Thank you for considering my application. I'm excited about the opportunity to contribute to your team and would love to discuss next steps."`,
        duration: 5,
        difficulty: 'intermediate',
        tags: ['interview', 'career', 'professional', 'job'],
        createdBy: admin._id
      },
      {
        title: 'Business Presentation',
        category: 'professional',
        topic: 'Delivering effective business presentations',
        description: 'Master the art of business presentations and public speaking',
        content: `# Business Presentation Script

## Opening (1 minute)
"Good morning everyone, thank you for joining us today. I'm [Name], and I'm here to discuss [topic]. By the end of this presentation, you'll understand [key objectives] and have actionable insights to implement."

## Agenda Overview (30 seconds)
"Here's what we'll cover today:
1. Current situation analysis
2. Proposed solutions
3. Implementation timeline
4. Expected outcomes
5. Q&A session"

## Main Content (8 minutes)
"Let's start with the current situation. [Present data and analysis]

Now, let me present our proposed solutions:
- Solution 1: [Description and benefits]
- Solution 2: [Description and benefits]
- Solution 3: [Description and benefits]

The implementation timeline looks like this:
- Phase 1: [Timeline and deliverables]
- Phase 2: [Timeline and deliverables]
- Phase 3: [Timeline and deliverables]"

## Conclusion (1 minute)
"In summary, we've discussed [key points]. The next steps are [action items]. I'm confident this approach will deliver [expected results]. Thank you for your attention."`,
        duration: 10,
        difficulty: 'advanced',
        tags: ['presentation', 'business', 'professional', 'communication'],
        createdBy: admin._id
      },
      // Personal Category
      {
        title: 'Overcoming Social Anxiety',
        category: 'personal',
        topic: 'Building confidence in social situations',
        description: 'Practical techniques to overcome social anxiety and build confidence',
        content: `# Overcoming Social Anxiety Script

## Introduction (1 minute)
"Hi, I'm [Name]. I used to struggle with social anxiety, but I've learned some techniques that have really helped me. Today, I want to share these with you because I believe they can help you too."

## Understanding Anxiety (2 minutes)
"Social anxiety often comes from fear of judgment. The good news is that most people are too focused on themselves to judge you harshly. Remember: everyone has insecurities."

## Practical Techniques (5 minutes)
"Here are the techniques that helped me:

1. **Breathing Exercise**: Take 4 deep breaths before entering social situations
2. **Positive Self-Talk**: Replace negative thoughts with positive ones
3. **Small Steps**: Start with small social interactions and build up
4. **Focus on Others**: Ask questions and listen actively
5. **Practice**: Join clubs or groups with similar interests"

## Real-Life Application (2 minutes)
"Start with these small steps:
- Smile and say hello to one person each day
- Join a conversation by asking a question
- Practice in low-pressure situations first
- Celebrate small victories"

## Encouragement (1 minute)
"Remember, building confidence takes time. Be patient with yourself. Every small step counts. You've got this!"`,
        duration: 10,
        difficulty: 'beginner',
        tags: ['anxiety', 'confidence', 'social', 'personal'],
        createdBy: admin._id
      },
      // Educational Category
      {
        title: 'Study Group Leadership',
        category: 'educational',
        topic: 'Leading effective study groups',
        description: 'How to lead and participate in productive study groups',
        content: `# Study Group Leadership Script

## Introduction (1 minute)
"Welcome to our study group! I'm [Name], and I'm excited to work together with all of you. Today we'll focus on [subject/topic]. Let's make this session productive and engaging."

## Setting Ground Rules (2 minutes)
"Before we start, let's establish some ground rules:
- Everyone participates - no one dominates
- Respect different learning styles
- Stay focused on the topic
- Ask questions freely
- Take breaks when needed"

## Learning Activities (15 minutes)
"Let's start with a quick review of last week's material:
- [Topic 1]: Who can summarize the key points?
- [Topic 2]: What questions do we have?
- [Topic 3]: How does this connect to what we learned before?

Now let's work on today's material:
- Read the chapter together
- Discuss key concepts
- Work through practice problems
- Share different approaches"

## Group Discussion (10 minutes)
"Let's discuss:
- What was the most challenging concept?
- How can we apply this in real life?
- What questions do we still have?
- How can we help each other understand better?"

## Planning Next Session (2 minutes)
"For next week:
- Review chapters [X-Y]
- Complete practice problems [A-B]
- Come prepared with questions
- Bring examples from real life"`,
        duration: 30,
        difficulty: 'intermediate',
        tags: ['education', 'study', 'leadership', 'group'],
        createdBy: admin._id
      },
      // Social Category
      {
        title: 'Networking at Events',
        category: 'social',
        topic: 'Effective networking strategies',
        description: 'How to network effectively at professional and social events',
        content: `# Networking at Events Script

## Opening Approach (1 minute)
"Hi, I'm [Name]. I don't think we've met before. I'm [brief introduction]. What brings you to this event?"

## Conversation Starters (2 minutes)
"Here are some great conversation starters:
- 'What's your connection to [event/organization]?'
- 'How long have you been in [industry/field]?'
- 'What's the most interesting project you're working on?'
- 'What trends are you seeing in [industry]?'"

## Active Listening (3 minutes)
"When networking, focus on:
- Making eye contact
- Asking follow-up questions
- Showing genuine interest
- Remembering names and details
- Sharing relevant experiences"

## Exchanging Information (2 minutes)
"To exchange contact information naturally:
- 'I'd love to continue this conversation'
- 'Do you have a business card?'
- 'Can I connect with you on LinkedIn?'
- 'Would you be interested in [specific follow-up]?'"

## Follow-up (1 minute)
"After the event:
- Send a personalized message within 24 hours
- Mention something specific from your conversation
- Suggest a specific next step
- Keep the relationship warm"`,
        duration: 10,
        difficulty: 'intermediate',
        tags: ['networking', 'social', 'professional', 'events'],
        createdBy: admin._id
      },
      // Creative Category
      {
        title: 'Storytelling Workshop',
        category: 'creative',
        topic: 'The art of storytelling',
        description: 'Learn to tell compelling stories that captivate your audience',
        content: `# Storytelling Workshop Script

## Introduction (1 minute)
"Welcome to our storytelling workshop! Stories have the power to connect, inspire, and move people. Today, we'll learn how to craft and deliver compelling stories."

## Elements of a Good Story (3 minutes)
"Every great story has:
1. **Character**: Someone the audience can relate to
2. **Conflict**: A challenge or problem to overcome
3. **Journey**: The path from problem to solution
4. **Resolution**: How the character grows or changes
5. **Message**: What the audience should take away"

## Story Structure (5 minutes)
"Use this structure:
- **Hook**: Start with something intriguing
- **Setup**: Introduce the character and situation
- **Conflict**: Present the challenge
- **Journey**: Show the struggle and growth
- **Climax**: The turning point
- **Resolution**: The outcome and lesson"

## Practice Exercise (10 minutes)
"Now let's practice:
1. Think of a personal experience that taught you something
2. Structure it using our framework
3. Practice telling it to a partner
4. Get feedback on what worked and what didn't"

## Delivery Tips (5 minutes)
"When telling your story:
- Use vivid descriptions
- Include dialogue
- Show emotions
- Use gestures and expressions
- Vary your pace and tone
- Make eye contact with your audience"`,
        duration: 25,
        difficulty: 'intermediate',
        tags: ['storytelling', 'creative', 'communication', 'workshop'],
        createdBy: admin._id
      },
      // Motivational Category
      {
        title: 'Goal Setting and Achievement',
        category: 'motivational',
        topic: 'Setting and achieving your goals',
        description: 'Motivational guide to setting and achieving personal and professional goals',
        content: `# Goal Setting and Achievement Script

## Introduction (1 minute)
"Today, we're going to talk about something that can transform your life: effective goal setting. I'm here to share a system that has helped me and countless others achieve their dreams."

## Why Goals Matter (2 minutes)
"Goals give us:
- Direction and purpose
- Motivation to keep going
- A way to measure progress
- A sense of accomplishment
- The power to create the life we want"

## SMART Goals Framework (5 minutes)
"Let's use the SMART framework:
- **S**pecific: Be clear and detailed
- **M**easurable: How will you know you've achieved it?
- **A**chievable: Realistic but challenging
- **R**elevant: Aligned with your values
- **T**ime-bound: Set a deadline"

## Action Planning (5 minutes)
"Break your goal into steps:
1. Write down your goal
2. Identify the steps needed
3. Set deadlines for each step
4. Identify potential obstacles
5. Create a support system
6. Track your progress regularly"

## Staying Motivated (3 minutes)
"To stay motivated:
- Celebrate small wins
- Visualize your success
- Surround yourself with supportive people
- Review your progress regularly
- Adjust your approach if needed
- Remember why you started"

## Call to Action (1 minute)
"Your goals are waiting for you. Start today. Take the first step. Believe in yourself. You have everything you need to succeed!"`,
        duration: 17,
        difficulty: 'beginner',
        tags: ['goals', 'motivation', 'success', 'achievement'],
        createdBy: admin._id
      }
    ];

    // Clear existing scripts
    await Script.deleteMany({});
    console.log('🗑️ Cleared existing scripts');

    // Create new scripts
    const createdScripts = await Script.insertMany(scripts);
    console.log(`✅ Created ${createdScripts.length} scripts successfully!`);

    // Display summary
    console.log('\n📊 Script Summary:');
    const categoryCount = {};
    createdScripts.forEach(script => {
      categoryCount[script.category] = (categoryCount[script.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} scripts`);
    });

    console.log('\n🎉 Scripts added to MongoDB Atlas successfully!');
    console.log('You can now test them on Vercel deployment.');

  } catch (error) {
    console.error('Error creating scripts:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addScriptsToAtlas();

