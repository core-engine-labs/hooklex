import { Request } from "@/types/request";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useRequestStore } from "@/lib/store/useRequestStore";

export const callback_Request = (req: {
  data: Request;
  collectionId: string;
}) => {
  useRequestStore.getState().addRequest(req.collectionId, req.data);
};

export const callback_Collection_Deleted = (req: {
  collectionId: string;
}) => {
  useCollectionStore.getState().removeCollection(req.collectionId);
};
