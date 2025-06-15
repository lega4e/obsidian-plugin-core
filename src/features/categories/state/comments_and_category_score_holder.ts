import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import { CommentWithCategory } from "./all_comments_holder";
import CategoriesHolder from "./categories_holder";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import ItemManager from "../managers/item_manager";

export interface CommentsAndCategoryScore {
  comments: CommentWithCategory[];
  categoryScore: Record<string, number>; // category name -> score
}

export default class CommentsAndCategoryScoreHolder extends LazyDerivedValueNotifier<CommentsAndCategoryScore> {
  constructor(
    pagesHolder: ValueNotifier<Record<string, any>[]>,
    categoriesHolder: CategoriesHolder
  ) {
    super([pagesHolder, categoriesHolder], () =>
      ItemManager.calcCommentsAndCategoryScore(
        pagesHolder.state,
        categoriesHolder.state!,
        categoriesHolder.state?.itemsFieldName ?? ""
      )
    );
  }
}
