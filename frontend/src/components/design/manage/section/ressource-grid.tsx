import { motion } from "framer-motion"
import { useState } from "react"
import { ResourceCard } from "./ressource-card"

export function ResourcesGrid({ resources }) {
    const [selectedResource, setSelectedResource] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleViewDetails = (resource) => {
        setSelectedResource(resource)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedResource(null)
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {resources.map((resource, index) => (
                    <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <ResourceCard resource={resource} onViewDetails={handleViewDetails} />
                    </motion.div>
                ))}
            </motion.div>

            {/* <ResourceDetailsModal resource={selectedResource} isOpen={isModalOpen} onClose={handleCloseModal} /> */}
        </>
    )
}