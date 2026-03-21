export interface ChatContext {
  alertTitle?: string
  alertCategory?: string
  alertSeverity?: string
  alertSummary?: string
  alertPersonalImpact?: string
}

const GENERAL_RESPONSES: Record<string, string> = {
  default:
    "That's a great question. Based on the legal changes we're tracking, here's what I can tell you: There are currently 15+ active legal and policy changes that may affect residents of Arizona. The most impactful ones relate to immigration processing, housing regulations, and healthcare subsidies. Would you like me to dive deeper into any specific area?",
  representative:
    "Based on your profile location, here are your key representatives:\n\n- U.S. Senator Mark Kelly (D-AZ)\n- U.S. Senator Ruben Gallego (D-AZ)\n- Your House representative depends on your district\n\nYou can reach Senator Kelly's office at (202) 224-2235 or visit kelly.senate.gov. For local matters, contact your state legislators through the Arizona Legislature website at azleg.gov.",
  h1b: "The H-1B Weighted Selection Final Rule is a significant change. Here's what you need to know:\n\n1. USCIS will implement a beneficiary-centric selection process\n2. This means each unique beneficiary gets one entry regardless of how many petitions are filed\n3. If you're on F-1 OPT hoping to transition to H-1B, this levels the playing field\n4. The rule takes effect for the FY2026 H-1B season\n\nAction: Start conversations with potential employers early and ensure your OPT status remains valid as a bridge.",
  aca: "The ACA subsidy situation in Arizona is critical:\n\n- Enhanced ACA premium subsidies are set to expire at the end of 2025\n- An estimated 125,000+ Arizonans could lose affordable coverage\n- Monthly premiums could increase by $200-400 for many enrollees\n\nIf you're currently on an ACA plan, monitor the open enrollment period closely. Consider reaching out to Cover Arizona (coveraz.org) for personalized guidance on your options.",
  affect:
    "Based on your profile, the changes most likely to affect you directly are:\n\n1. Immigration-related changes (if applicable to your visa status)\n2. Healthcare subsidy changes in Arizona\n3. Housing regulation updates\n4. Tax policy modifications\n\nEach alert on your dashboard is personalized with a relevance score. I'd recommend focusing on HIGH severity alerts first and reviewing their action items.",
  contact:
    "Here are the best ways to make your voice heard:\n\n1. Call your representatives directly (most effective)\n2. Submit written comments during public comment periods\n3. Attend town halls and public hearings\n4. Write letters to local newspapers\n\nWant me to help you draft a letter to your representative about a specific issue?",
  draft:
    "I can help you draft a letter. Here's a template you can customize:\n\n---\nDear [Representative Name],\n\nAs a constituent in [your district], I'm writing regarding [specific policy/change]. This directly impacts me because [personal connection].\n\nI respectfully urge you to [specific ask]. This matters because [reason].\n\nThank you for your service and attention to this matter.\n\nSincerely,\n[Your Name]\n[Your Address]\n---\n\nWould you like me to customize this for a specific issue?",
  hearing:
    "Here's how to find and participate in public hearings:\n\n1. Federal rules: Check regulations.gov for open comment periods and scheduled hearings\n2. Arizona Legislature: Visit azleg.gov/hearing-schedule for committee hearings\n3. Local government: Check your city/county clerk's website for public meetings\n\nMany hearings now offer virtual attendance options. You can also submit written testimony if you can't attend in person. Would you like help preparing testimony?",
  publicComment:
    "Here's how to submit an effective public comment:\n\n1. Be specific about which provision you're commenting on\n2. Share your personal story and how the change affects you\n3. Include data or evidence to support your position\n4. Be respectful but direct\n5. Submit before the deadline\n\nHere's a template:\n\n---\nRE: [Docket/Rule Number]\n\nI am writing to [support/oppose] the proposed [rule/change]. As a [your role], this directly affects me because [personal impact].\n\n[Specific concerns or suggestions]\n\nThank you for considering my comment.\n[Your Name]\n---\n\nWould you like me to customize this for a specific policy?",
}

function findBestMatch(input: string): string {
  const lower = input.toLowerCase()

  if (lower.includes('representative') || lower.includes('senator') || lower.includes('contact my')) {
    return GENERAL_RESPONSES.representative
  }
  if (lower.includes('h-1b') || lower.includes('h1b') || lower.includes('visa')) {
    return GENERAL_RESPONSES.h1b
  }
  if (lower.includes('aca') || lower.includes('subsidy') || lower.includes('insurance') || lower.includes('healthcare')) {
    return GENERAL_RESPONSES.aca
  }
  if (lower.includes('affect') || lower.includes('impact') || lower.includes('most')) {
    return GENERAL_RESPONSES.affect
  }
  if (lower.includes('contact') || lower.includes('voice') || lower.includes('heard')) {
    return GENERAL_RESPONSES.contact
  }
  if (lower.includes('draft') || lower.includes('letter') || lower.includes('write')) {
    return GENERAL_RESPONSES.draft
  }
  if (lower.includes('hearing') || lower.includes('testimony') || lower.includes('attend')) {
    return GENERAL_RESPONSES.hearing
  }
  if (lower.includes('public comment') || lower.includes('comment on') || lower.includes('submit comment')) {
    return GENERAL_RESPONSES.publicComment
  }

  return GENERAL_RESPONSES.default
}

function getContextualResponse(input: string, context: ChatContext): string {
  const lower = input.toLowerCase()

  if (lower.includes('affect') || lower.includes('impact') || lower.includes('how does')) {
    return `Regarding "${context.alertTitle}": ${context.alertPersonalImpact || context.alertSummary || 'This change may affect various aspects of your daily life depending on your specific circumstances.'}. I'd recommend reviewing the full alert details and action items on your dashboard for the most comprehensive guidance.`
  }

  if (lower.includes('action') || lower.includes('should i do') || lower.includes('what can i')) {
    return `For "${context.alertTitle}", here are recommended steps:\n\n1. Review the full alert details for specific action items and deadlines\n2. Check if any public comment periods are currently open\n3. Consider consulting with a qualified professional if this has significant personal impact\n4. Set a reminder for any upcoming effective dates\n5. Contact your representative if you want to express your position\n\nWould you like help with any of these steps?`
  }

  if (lower.includes('when') || lower.includes('take effect') || lower.includes('date') || lower.includes('deadline')) {
    return `The timeline for "${context.alertTitle}" varies. Key dates to watch:\n\n- Publication date: Check the source document linked in the alert\n- Public comment period: May be open if the rule is in proposed stage\n- Effective date: Listed in the alert details\n\nI recommend checking the official source link for the most current timeline information. Regulatory timelines can shift based on legal challenges or administrative delays.`
  }

  if (lower.includes('draft') || lower.includes('letter')) {
    return `Here's a draft letter about "${context.alertTitle}":\n\n---\nDear [Representative Name],\n\nAs your constituent in Arizona, I'm writing regarding ${context.alertTitle}. ${context.alertPersonalImpact || 'This policy change directly impacts me and my community.'}\n\nI urge you to consider the real-world impact of this change on Arizona residents. Specifically, I ask that you [support protections / oppose harmful provisions / push for amendments].\n\nThank you for your attention to this matter.\n\nSincerely,\n[Your Name]\n---\n\nI'd recommend personalizing the bracketed sections and adding any specific details about how this affects you. Would you like me to refine any section?`
  }

  if (lower.includes('hearing') || lower.includes('testimony')) {
    const isFederal = context.alertCategory === 'immigration' || context.alertCategory === 'taxation' || context.alertCategory === 'healthcare'
    return `For "${context.alertTitle}":\n\n${isFederal ? '- Check regulations.gov for federal comment periods and hearing schedules\n- The relevant agency may hold public listening sessions before finalizing rules' : '- Check azleg.gov/hearing-schedule for Arizona Legislature committee hearings\n- Your city/county may hold local public meetings on this topic'}\n- Sign up for email alerts from the implementing agency\n- Many hearings now offer virtual attendance\n\nTo prepare testimony:\n1. Keep it under 3 minutes if speaking in person\n2. Lead with your personal story\n3. Reference specific provisions\n4. Offer constructive alternatives\n\nWould you like help preparing your testimony?`
  }

  if (lower.includes('public comment') || lower.includes('comment')) {
    return `Here's a draft public comment for "${context.alertTitle}":\n\n---\nRE: ${context.alertTitle}\n\nI am writing as an Arizona resident directly affected by this policy change. ${context.alertPersonalImpact || 'This change has significant implications for my daily life.'}\n\nI respectfully request that the implementing agency consider:\n1. The disproportionate impact on [affected community]\n2. The timeline for implementation and transition support\n3. Additional guidance for individuals navigating this change\n\nThank you for considering public input on this matter.\n[Your Name]\n---\n\nCustomize the bracketed sections with your details. Submit before the comment period deadline listed in the source document.`
  }

  if (lower.includes('contact') || lower.includes('who') || lower.includes('representative')) {
    return `For the issue of "${context.alertTitle}", you can contact:\n\n- Your U.S. Senators: Mark Kelly & Ruben Gallego (for federal issues)\n- Your state legislators: Find them at azleg.gov\n- Relevant agencies: The implementing federal or state agency\n\nPublic comment is often the most direct way to influence policy. Check if there's an open comment period in the source document.`
  }

  return `"${context.alertTitle}" is a ${context.alertSeverity || 'notable'} severity change in the ${context.alertCategory || 'policy'} category. ${context.alertSummary || ''}\n\nWould you like to know more about how this specifically affects you, what actions to take, or when this takes effect?`
}

export function getMockChatResponse(input: string, context?: ChatContext): string {
  if (context?.alertTitle) {
    return getContextualResponse(input, context)
  }
  return findBestMatch(input)
}
