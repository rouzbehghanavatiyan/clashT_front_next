"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserListLayout from "@/common/UserListLayout";
import { useAppSelector } from "@/store/reduxHook";
import { blockListByUser, userUnBlock } from "@/services/user.service";

export default function BlockListPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [blockList, setBlockList] = useState<any[]>([]);
  const router = useRouter();

  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const userLoginId = userLogin?.user?.id || userLogin?.userId;

  const handleBlockList = async () => {
    try {
      setIsLoading(true);
      const res = await blockListByUser();
      const { data, status } = res?.data || {};

      if (status === 0) {
        setBlockList(data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnBlockByUser = async (targetUserId: any) => {
    try {
      const postData = {
        blockerId: userLoginId,
        targetUserId,
      };

      setIsLoading(true);
      const res = await userUnBlock(postData);
      const { data, status } = res?.data || {};
      console.log("unblock res", data);

      if (status === 0) {
        setBlockList((prev) =>
          prev.filter((user: any) => {
            const id =
              user?.attachment?.attachmentId ||
              user?.userId ||
              user?.id ||
              user?.sender;
            return id !== targetUserId;
          }),
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleBlockList();
  }, []);

  return (
    <UserListLayout
      title="Block List"
      isLoading={isLoading}
      data={blockList}
      emptyMessage="There are no blocked users."
      onBack={() => router.back()}
      onUnblock={handleUnBlockByUser}
      onRefresh={handleBlockList}
      refreshing={isLoading}
    />
  );
}
