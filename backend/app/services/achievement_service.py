from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import String, cast, desc, func, literal, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievementPointRules import AchievementPointRule
from app.models.class_model import Class
from app.models.club import Club
from app.models.club_membership import ClubMembership
from app.models.mark import Mark
from app.models.profile import Profile
from app.models.student import Student
from app.models.student_achievement import StudentAchievement
from app.schemas.achievement_schema import AchievementPointRuleCreate, AchievementPointRuleUpdate, AchievementType, LeaderboardClub, LeaderboardStudent, StudentAchievementCreate, StudentAchievementUpdate


class AchievementService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    # --- Achievement Point Rules Management ---

    async def create_rule(self, rule_data: AchievementPointRuleCreate, school_id: int) -> AchievementPointRule:
        """Creates a new achievement point rule."""
        db_rule = AchievementPointRule(**rule_data.model_dump(), school_id=school_id)
        self.db.add(db_rule)
        await self.db.commit()
        await self.db.refresh(db_rule)
        return db_rule

    async def get_rule(self, rule_id: int, school_id: int) -> AchievementPointRule | None:
        """Gets a single achievement point rule by ID."""
        result = await self.db.execute(select(AchievementPointRule).where(AchievementPointRule.id == rule_id, AchievementPointRule.school_id == school_id))
        return result.scalars().first()

    async def get_rules_by_school(self, school_id: int) -> list[AchievementPointRule]:
        """Gets all achievement point rules for a school."""
        result = await self.db.execute(select(AchievementPointRule).where(AchievementPointRule.school_id == school_id))
        return result.scalars().all()

    async def update_rule(self, rule_id: int, rule_data: AchievementPointRuleUpdate, school_id: int) -> AchievementPointRule | None:
        """Updates an achievement point rule."""
        db_rule = await self.get_rule(rule_id, school_id)
        if not db_rule:
            return None

        update_data = rule_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_rule, key, value)

        await self.db.commit()
        await self.db.refresh(db_rule)
        return db_rule

    async def delete_rule(self, rule_id: int, school_id: int) -> bool:
        """Deletes an achievement point rule."""
        db_rule = await self.get_rule(rule_id, school_id)
        if not db_rule:
            return False

        await self.db.delete(db_rule)
        await self.db.commit()
        return True

    async def _get_rule_by_type_and_category(self, school_id: int, ach_type: AchievementType, category: str) -> AchievementPointRule | None:
        """Internal helper to find a rule for calculation."""
        result = await self.db.execute(
            select(AchievementPointRule).where(
                AchievementPointRule.school_id == school_id,
                AchievementPointRule.achievement_type == ach_type,
                AchievementPointRule.category_name == category,
                AchievementPointRule.is_active.is_(True),
            )
        )
        return result.scalars().first()

    # --- Student Achievement Management ---

    async def add_achievement(self, achievement_data: StudentAchievementCreate, awarded_by_user_id: UUID, school_id: int) -> Optional[StudentAchievement]:
        """
        Adds a new student achievement, initially unverified and with 0 points.
        """
        student_query = select(Student.student_id).join(Profile, Student.user_id == Profile.user_id).where(Student.student_id == achievement_data.student_id, Profile.school_id == school_id)
        result = await self.db.execute(student_query)
        if not result.scalars().first():
            return None

        db_achievement = StudentAchievement(**achievement_data.model_dump(), school_id=school_id, awarded_by_user_id=awarded_by_user_id, is_verified=False, points_awarded=0)  # Points are awarded upon verification
        self.db.add(db_achievement)
        await self.db.commit()
        await self.db.refresh(db_achievement)
        return db_achievement

    async def verify_achievement(self, achievement_id: int, verified_by_user_id: UUID, school_id: int) -> StudentAchievement | None:
        """
        Verifies an achievement, auto-calculating and awarding points.
        """
        db_achievement = await self.get_achievement_by_id(achievement_id, school_id)

        if not db_achievement:
            return None  # Not found
        if db_achievement.is_verified:
            return db_achievement  # Already verified

        # Find the matching rule to auto-calculate points
        rule = await self._get_rule_by_type_and_category(school_id=school_id, ach_type=db_achievement.achievement_type, category=db_achievement.achievement_category)

        points_to_award = 0
        if rule:
            # As per schema, 'level' is not stored on student_achievement.
            # We can only use base_points.
            points_to_award = rule.base_points

        db_achievement.is_verified = True
        db_achievement.verified_by_user_id = verified_by_user_id
        db_achievement.verified_at = datetime.utcnow()
        db_achievement.points_awarded = points_to_award

        await self.db.commit()
        await self.db.refresh(db_achievement)
        return db_achievement

    async def get_student_achievements(self, student_id: int, school_id: int, only_verified: bool) -> list[StudentAchievement]:
        """Gets achievements for a specific student."""
        query = select(StudentAchievement).where(StudentAchievement.student_id == student_id, StudentAchievement.school_id == school_id).order_by(desc(StudentAchievement.date_awarded))

        if only_verified:
            query = query.where(StudentAchievement.is_verified.is_(True))

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_achievement_by_id(self, achievement_id: int, school_id: int) -> StudentAchievement | None:
        """Gets a single achievement by its ID."""
        result = await self.db.execute(select(StudentAchievement).where(StudentAchievement.id == achievement_id, StudentAchievement.school_id == school_id))
        return result.scalars().first()

    async def update_achievement(self, achievement_id: int, achievement_data: StudentAchievementUpdate, school_id: int) -> StudentAchievement | None:
        """Updates an achievement, only if it is NOT verified."""
        db_achievement = await self.get_achievement_by_id(achievement_id, school_id)

        if not db_achievement:
            return None
        if db_achievement.is_verified:
            # Cannot update a verified achievement
            return None

        update_data = achievement_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_achievement, key, value)

        await self.db.commit()
        await self.db.refresh(db_achievement)
        return db_achievement

    async def delete_achievement(self, achievement_id: int, school_id: int) -> bool:
        """Deletes an achievement, only if it is NOT verified."""
        db_achievement = await self.get_achievement_by_id(achievement_id, school_id)

        if not db_achievement:
            return False
        if db_achievement.is_verified:
            # Cannot delete a verified achievement
            return False

        await self.db.delete(db_achievement)
        await self.db.commit()
        return True

    # --- Leaderboard Computation ---

    async def _get_student_base_query(self, school_id: int, academic_year_id: int, class_id: int | None = None):
        """Helper to build the base query for student leaderboards."""

        # 1. Get all students in scope (school or class)
        student_name_expr = func.trim(func.coalesce(Profile.first_name, "") + literal(" ") + func.coalesce(Profile.last_name, ""))

        class_name_expr = func.trim(func.coalesce(cast(Class.grade_level, String), literal("")) + literal(" ") + func.coalesce(Class.section, ""))

        student_query = (
            select(Student.student_id, student_name_expr.label("student_name"), Class.class_id, class_name_expr.label("class_name"))
            .join(Profile, Student.user_id == Profile.user_id)
            .join(Class, Student.current_class_id == Class.class_id, isouter=True)
            .where(Profile.school_id == school_id)
        )
        if class_id:
            student_query = student_query.where(Student.current_class_id == class_id)

        students_cte = student_query.cte("students_in_scope")

        # 2. Sum achievements
        ach_query = (
            select(StudentAchievement.student_id, func.sum(StudentAchievement.points_awarded).label("achievement_points"))
            .where(
                StudentAchievement.school_id == school_id,
                StudentAchievement.academic_year_id == academic_year_id,
                StudentAchievement.is_verified.is_(True),
            )
            .group_by(StudentAchievement.student_id)
        ).cte("achievement_scores")

        # 3. Sum exam marks
        mark_query = (
            select(Mark.student_id, func.sum(Mark.marks_obtained).label("exam_points"))
            .where(
                Mark.school_id == school_id,
                # TODO: We need to filter marks by academic_year_id,
                # which requires joining Mark -> Exam -> academic_year_id
                # For now, simplifying by omitting AY filter on marks
            )
            .group_by(Mark.student_id)
        ).cte("exam_scores")

        # 4. Sum club contributions
        club_query = (
            select(ClubMembership.student_id, func.sum(ClubMembership.contribution_score).label("club_points"))
            .join(Club, ClubMembership.club_id == Club.id)
            .where(Club.school_id == school_id, Club.academic_year_id == academic_year_id, ClubMembership.status == "active")
            .group_by(ClubMembership.student_id)
        ).cte("club_scores")

        # 5. Combine all scores
        final_query = (
            select(
                students_cte.c.student_id,
                students_cte.c.student_name,
                students_cte.c.class_id,
                students_cte.c.class_name,
                func.coalesce(ach_query.c.achievement_points, 0).label("achievement_points"),
                func.coalesce(mark_query.c.exam_points, 0).label("exam_points"),
                func.coalesce(club_query.c.club_points, 0).label("club_points"),
                (func.coalesce(ach_query.c.achievement_points, 0) + func.coalesce(mark_query.c.exam_points, 0) + func.coalesce(club_query.c.club_points, 0)).label("total_points"),
            )
            .join(ach_query, students_cte.c.student_id == ach_query.c.student_id, isouter=True)
            .join(mark_query, students_cte.c.student_id == mark_query.c.student_id, isouter=True)
            .join(club_query, students_cte.c.student_id == club_query.c.student_id, isouter=True)
            .order_by(desc("total_points"))
        )

        return final_query

    async def get_school_leaderboard(self, school_id: int, academic_year_id: int) -> list[LeaderboardStudent]:
        """Computes the leaderboard for the entire school."""
        query = await self._get_student_base_query(school_id, academic_year_id)
        result = await self.db.execute(query)
        return [LeaderboardStudent(**row) for row in result.mappings()]

    async def get_class_leaderboard(self, class_id: int, school_id: int, academic_year_id: int) -> list[LeaderboardStudent]:
        """Computes the leaderboard for a specific class."""
        query = await self._get_student_base_query(school_id, academic_year_id, class_id=class_id)
        result = await self.db.execute(query)
        return [LeaderboardStudent(**row) for row in result.mappings()]

    async def get_club_leaderboard(self, school_id: int, academic_year_id: int) -> list[LeaderboardClub]:
        """Computes the leaderboard for all clubs in the school."""
        query = (
            select(Club.id.label("club_id"), Club.name.label("club_name"), func.sum(func.coalesce(ClubMembership.contribution_score, 0)).label("total_points"))
            .join(ClubMembership, Club.id == ClubMembership.club_id, isouter=True)
            .where(
                Club.school_id == school_id,
                Club.academic_year_id == academic_year_id,
                Club.is_active.is_(True),
            )
            .group_by(Club.id, Club.name)
            .order_by(desc("total_points"))
        )

        result = await self.db.execute(query)
        return [LeaderboardClub(**row) for row in result.mappings()]
