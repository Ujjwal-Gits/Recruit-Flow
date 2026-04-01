import BouncyLoader from '@/components/BouncyLoader';

export default function LoginLoading() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <BouncyLoader />
        </div>
    );
}
