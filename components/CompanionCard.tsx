"use client";

import { removeBookmark, addBookmark, getCompanionsWithBookmarkStatus } from "@/lib/actions/companions.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
}: CompanionCardProps) => {
  const pathname = usePathname();
  const { userId } = useAuth(); // get logged-in user
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial bookmark status
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!userId) {
        setIsBookmarked(false);
        setLoading(false);
        return;
      }

      try {
        const companions = await getCompanionsWithBookmarkStatus(userId);
        const found = companions.find((c: any) => c.id === id);
        setIsBookmarked(found?.bookmarked ?? false);
      } catch (error) {
        console.error("Error fetching bookmark status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkStatus();
  }, [userId, id]);

  const handleBookmark = async () => {
    if (!userId) return; // prevent unauthenticated actions

    try {
      if (isBookmarked) {
        setIsBookmarked(false);
        await removeBookmark(id, pathname);
      } else {
        setIsBookmarked(true);
        await addBookmark(id, pathname);
      }
    } catch (error) {
      console.error("Bookmark action failed:", error);
    }
  };

  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <button
          className="companion-bookmark"
          onClick={handleBookmark}
          disabled={loading}
        >
          <Image
            src={
              isBookmarked
                ? "/icons/bookmark-filled.svg"
                : "/icons/bookmark.svg"
            }
            alt="bookmark"
            width={12.5}
            height={15}
          />
        </button>
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} minutes</p>
      </div>

      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">
          Launch Lesson
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;
