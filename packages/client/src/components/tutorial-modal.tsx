import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Pagination} from "@nextui-org/react";
import { ReadTutorialTask } from "./tutorial-task";
import { useState } from "react";

interface tutorialProps {
    tasks: any[];
}

export const TutorialModal = ({ tasks }: tutorialProps) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [currentPage, setCurrentPage] = useState(tasks.length);

    return(
        <>
            <div 
                className="absolute flex cursor-pointer justify-center items-center text-center right-2 bottom-2 w-12 z-40 rounded-full aspect-square bg-white border border-purple-400 hover:bg-purple-300"
                onClick={onOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            </div>
            <Modal
                size="4xl"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                classNames={{
                    base: "bg-transparent",
                }}
            >
                    
                <ModalContent>
                    {(onClose) => (
                        <div className="flex flex-col items-center gap-2">
                            <ReadTutorialTask
                                id={tasks[currentPage - 1].id}
                                description={tasks[currentPage - 1].description}
                                content={tasks[currentPage - 1].content}
                                onCompletion={onClose}
                                modal={true}
                            />
                            {tasks.length > 1 && <Pagination
                                total={tasks.length}
                                showControls={true}
                                page={currentPage}
                                onChange={setCurrentPage}
                            />}
                        </div>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
