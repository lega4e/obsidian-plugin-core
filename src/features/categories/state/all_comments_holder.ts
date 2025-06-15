import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import CommentsAndCategoryScoreHolder from "./comments_and_category_score_holder";

export interface CommentWithCategory {
  comment: string;
  categoryName: string | null;
  categoryPrettyName: string | null;
}

export default class AllCommentsHolder extends LazyDerivedValueNotifier<
  CommentWithCategory[]
> {
  constructor(commentsAndCategoryScoreHolder: CommentsAndCategoryScoreHolder) {
    super(
      [commentsAndCategoryScoreHolder],
      () => commentsAndCategoryScoreHolder.state!.comments
    );
  }
}
