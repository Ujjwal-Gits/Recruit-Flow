
export interface Job {
    id: string;
    title: string;
    company_name: string;
    description: string;
    created_at: string;
    applications: { count: number }[];
}

export interface Meeting {
    id: string;
    start_time: string;
    end_time: string;
    mode: string;
    title: string;
    notes: string;
    status: string;
    candidate_name: string;
    candidate_email: string;
    application_id?: string | null;
}

export interface CRMCandidate {
    id: string;
    name: string;
    email: string;
    resume_url: string;
    ats_score?: number;
    status: string;
    job_title: string;
    company_name?: string;
    created_at: string;
    job_id?: string;
}
