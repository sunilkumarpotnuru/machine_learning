export interface Prompt {
  text: string;
  source: string;
}

export const prompts: Prompt[] = [
  {
    text: 'The support agent solved my ticket and followed up the next day just to make sure everything still worked.',
    source: 'Customer Support',
  },
  {
    text: 'I am not convinced this release is ready; the installer crashed twice and wiped my preferences.',
    source: 'Product Launch',
  },
  {
    text: 'The onboarding tutorial is clear, but the dashboard still feels cluttered and overwhelming.',
    source: 'User Experience',
  },
  {
    text: 'We just closed our biggest client and the whole room erupted in cheers and confetti!',
    source: 'Sales Update',
  },
  {
    text: 'After three delays, the shipment finally arrived in perfect condition and the crew applauded the driver.',
    source: 'Logistics',
  },
  {
    text: 'I keep submitting my report, but the portal spins forever without saving anything.',
    source: 'Operations',
  },
  {
    text: 'The new interface looks slick and the animations feel buttery smooth on every device.',
    source: 'Product Review',
  },
  {
    text: 'I am cautiously optimistic about the partnership; the potential is huge if the teams stay aligned.',
    source: 'Strategy Meeting',
  },
  {
    text: 'My laptop froze during the presentation and I wanted to crawl under the table.',
    source: 'Conference',
  },
  {
    text: 'We reached the milestone early and surprised the team with cupcakes and celebration playlists.',
    source: 'Team Stand-up',
  },
  {
    text: 'The weather is mild and the conference vibe is relaxed, nothing too exciting or stressful right now.',
    source: 'Event Update',
  },
  {
    text: 'No one responded to my questions all afternoon, and I am starting to feel ignored by the group.',
    source: 'Community Chat',
  },
  {
    text: 'The latest sprint was exhausting but the feature set is promising and already wowing early testers.',
    source: 'Sprint Review',
  },
  {
    text: 'My phone battery drains so fast that I cannot get through a single meeting without grabbing a charger.',
    source: 'Hardware Feedback',
  },
  {
    text: 'The museum exhibit was surprisingly engaging and every interactive story felt magical.',
    source: 'Weekend Plans',
  },
  {
    text: 'I expected more from the keynote; it was long-winded and left the audience restless.',
    source: 'Keynote Debrief',
  },
  {
    text: 'The prototype is not perfect yet, but it already delights our testers and sparks bold ideas.',
    source: 'Innovation Lab',
  },
  {
    text: 'Traffic was brutal this morning, leaving everyone stressed, late, and cranky.',
    source: 'Commuter Log',
  },
  {
    text: 'We are reorganizing our notes and planning the next iteration with calm focus.',
    source: 'Planning Session',
  },
  {
    text: 'The mentor gave balanced feedback, pointing out strengths and areas to improve without sugarcoating.',
    source: 'Mentorship',
  },
];
