import { RequestDetailView } from "@/components/request-detail-viewer"


interface PageProps {
    params: Promise<{ id: string }>
}



const page = async ({ params }: PageProps) => {
    const { id } = await params
    return (
        <div className="w-full h-screen overflow-y-scroll">
            <RequestDetailView id={id}  />
        </div>
    )
}

export default page