<img src="./public/parallel_black.png" alt="parallel" width="180">

## fuck around, find out

the more you explore, the better your odds of finding something great. cast a wider net and the chances something in it is worth keeping go up. same with people, meet more of them and your odds of meeting a genuinely great one go up too.

parallel connects you with a random stranger in your own field and lets that surprise do its thing.

live demo: [add your deployed url here]
github: [add your repo url here]

this isn't just a hackathon project. i've had this idea in my head for a long time. hack club horizons is what actually pushed me to sit down, build it, and ship a real version.

## why i built this

i've been to a bunch of networking events, and the best part was never the talks, it was who i randomly ended up meeting. some of those people are still around years later. but networking events are narrow, a startup event gets you startup people, a fashion event gets you fashion people. you're only ever surprised within a small box.

parallel is that same idea without the box. you get connected with someone in your field, but you don't know who they are going in, no name, no company, just a short description. you chat only long enough to agree on a time, then meet live online, and only then find out who you were actually talking to.

this is also the first real backend i've built end to end, auth, a full schema, row level security, realtime chat, all of it. i've mostly worked with firebase before, so this is my first time building on supabase too.

## what it does

- you sign up and fill out a short profile: what you do, years of experience, timezone. no name is ever collected.
- you get connected with someone in your field.
- you chat with them just to agree on a time to meet. the chat is explicitly for scheduling only, nothing else.
- when you propose a time, it's shown to the other person converted into their own timezone automatically. both people have to confirm before it locks in.
- once confirmed, you both get a meeting link and a time. you meet as strangers.
- after the meet, you can leave feedback for the other person, visible on their profile.

## how it works

**auth** — supabase auth, email/password and google oauth.

**database** — supabase postgres, with row level security policies on every table so people can only see and edit what they're supposed to.

**matching** — there are two systems built for this. a keyword-based text matching system, which is what's actually running right now, compares two people's descriptions, strips out filler words, and scores them by how many meaningful words they share. an ai-based matching system is also fully coded but not currently wired up live, it would use an llm to judge compatibility instead of just counting shared words.

**realtime chat** — built on supabase realtime, so messages show up instantly on both sides without a refresh.

**meeting confirmation** — both people propose and confirm a time inside the chat, each seeing it in their own local timezone.

**we are intentionally not using paid ai apis or email apis in this build. both cost money to run, and for a hackathon demo we didn't want to burn api credits or risk something breaking mid-review because of a rate limit or a billing issue. the code for both is fully written and sitting in the repo (email through resend, ai matching through openai), just switched off. turning either one on is a one line change.**

## screenshots

1. `login.png` — login screen
2. `onboarding.png` — profile setup
3. `home.png` — home tab
4. `connects.png` — connects tab
5. `profile.png` — profile tab
6. `chat.png` — chat and scheduling

## tech stack

- next.js (app router), typescript
- supabase — auth, postgres, row level security, realtime
- resend — email (currently disabled, see above)
- openai — ai matching (currently disabled, see above)
- hand-written css, no ui framework
- lucide icons
- deployed on vercel

## status

the core loop works end to end: sign up, get connected with someone in your field, chat to agree on a time, confirm a meeting, and go talk to a stranger you knew nothing about going in.

this is version one. once this is through review, we're building out a full landing page and taking it from here, this is going to be the coolest thing.