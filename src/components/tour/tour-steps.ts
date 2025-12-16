
import type { TourStep } from './tour-context';

export const dashboardTourSteps: TourStep[] = [
    {
        id: 'step-1',
        targetId: 'tour-step-1',
        title: 'Create a New Proposal',
        content: 'Click here to start the Proposal Wizard. This will guide you through creating a new proposal for a client.',
        side: 'bottom',
        align: 'end',
    },
    {
        id: 'step-2',
        targetId: 'tour-step-2',
        title: 'Search & Filter',
        content: 'You can quickly find proposals by searching by title or client name. Use the filter to see proposals by their current status.',
        side: 'bottom',
        align: 'start',
    },
    {
        id: 'step-3',
        targetId: 'tour-step-3',
        title: 'Your Proposals',
        content: 'This is where all your proposals live. You can see their status, total value, and when they were last updated. Click on any card to see the details.',
        side: 'top',
        align: 'center',
    },
];

export const proposalWizardTourSteps: TourStep[] = [
     {
        id: 'wizard-step-1',
        targetId: 'wizard-step-1',
        title: 'Select a Template',
        content: 'Start by choosing a template. Templates define the structure and boilerplate content for your proposal.',
        side: 'top',
        align: 'center',
    },
    {
        id: 'wizard-step-2',
        targetId: 'wizard-step-2',
        title: 'Generate Content with AI',
        content: "Select a client, then use our AI tools. Paste meeting notes to generate an executive summary, or paste a full transcript to have the AI analyze it, suggest products, and draft entire sections!",
        side: 'top',
        align: 'center',
    },
     {
        id: 'wizard-step-3',
        targetId: 'wizard-step-3',
        title: 'Select Products & Services',
        content: "Add the products and services for this proposal. The total price will update dynamically on the right as you make selections.",
        side: 'top',
        align: 'center',
    },
    {
        id: 'wizard-step-4',
        targetId: 'wizard-step-4',
        title: 'Finalize Proposal',
        content: "Review the summary of your new proposal. When you're ready, click 'Save and Finalize' to create the proposal and view its detail page.",
        side: 'top',
        align: 'center',
    },
];


export const proposalDetailTourSteps = (isAgent: boolean): TourStep[] => {
    const commonSteps = [
        {
            id: 'detail-step-3',
            targetId: 'tour-step-3',
            title: 'Comments & Discussion',
            content: 'Collaborate with your client or team here. All comments are posted in real-time, making communication seamless.',
            side: 'top',
            align: 'center',
        }
    ];

    if (isAgent) {
        return [
            {
                id: 'detail-step-agent-1',
                targetId: 'tour-step-agent-1',
                title: 'Engagement Analytics',
                content: 'Track how your client is interacting with the proposal. See the total number of views and when it was last opened.',
                side: 'top',
                align: 'center',
            },
            {
                id: 'detail-step-agent-2',
                targetId: 'tour-step-agent-2',
                title: 'Review Suggestions',
                content: 'When a client suggests an edit, it will appear here. You can review the changes and choose to accept or reject them.',
                side: 'bottom',
                align: 'center',
            },
            ...commonSteps,
        ];
    }

    return [
         {
            id: 'detail-step-client-1',
            targetId: 'tour-step-client-1',
            title: 'Suggest Edits',
            content: "Need a change? Hover over any section and click 'Suggest Edit'. The sales agent will be notified of your proposed changes.",
            side: 'bottom',
            align: 'center',
        },
        {
            id: 'detail-step-client-2',
            targetId: 'tour-step-client-2',
            title: 'Client Actions',
            content: 'When you are ready, you can accept and e-sign the proposal, or download a PDF copy for your records right from this panel.',
            side: 'top',
            align: 'center',
        },
        ...commonSteps,
    ];
};
