import BouncyLoader from '@/components/BouncyLoader';

export default function TermsLoading() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <BouncyLoader />
        </div>
    );
}
