import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import CommentsAndCategoryScoreHolder from "./comments_and_category_score_holder";

export default class CategoryScoreHolder extends LazyDerivedValueNotifier<
  Record<string, number> // category name -> score
> {
  constructor(commentsAndCategoryScoreHolder: CommentsAndCategoryScoreHolder) {
    super(
      [commentsAndCategoryScoreHolder],
      () => commentsAndCategoryScoreHolder.state!.categoryScore
    );
  }
}
