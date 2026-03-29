import BouncyLoader from '@/components/BouncyLoader';

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <BouncyLoader />
        </div>
    );
}
