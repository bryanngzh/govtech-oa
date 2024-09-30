import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Match } from "../../../entities/Match";

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatch: Match | null;
  handleUpdate: (updatedInput: string) => void;
}

const EditMatchModal = ({
  isOpen,
  onClose,
  selectedMatch,
  handleUpdate,
}: EditMatchModalProps) => {
  const [localInput, setLocalInput] = useState<string>("");

  useEffect(() => {
    if (selectedMatch) {
      setLocalInput(
        `${selectedMatch.teamA} ${selectedMatch.teamB} ${selectedMatch.scoreA} ${selectedMatch.scoreB}`
      );
    }
  }, [selectedMatch]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Match</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>Edit Match Details</FormLabel>
            <Input
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="Format: <teamA> <teamB> <scoreA> <scoreB>"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => handleUpdate(localInput)}
          >
            Update
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditMatchModal;
