import BouncyLoader from '@/components/BouncyLoader';

export default function AboutLoading() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <BouncyLoader />
        </div>
    );
}
