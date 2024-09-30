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
import { Team } from "../../../entities/Team";

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: Team | null;
  handleUpdate: (updatedInput: string) => void;
}

const EditTeamModal = ({
  isOpen,
  onClose,
  selectedTeam,
  handleUpdate,
}: EditTeamModalProps) => {
  const [localInput, setLocalInput] = useState<string>("");

  useEffect(() => {
    if (selectedTeam) {
      setLocalInput(
        `${selectedTeam.id} ${new Date(selectedTeam.regDate).toLocaleDateString(
          "en-GB"
        )} ${selectedTeam.group}`
      );
    }
  }, [selectedTeam]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Team</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>Edit Team Details</FormLabel>
            <Input
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="Format: <Team Name> <Registration Date (DD/MM)> <Group Number>"
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

export default EditTeamModal;
