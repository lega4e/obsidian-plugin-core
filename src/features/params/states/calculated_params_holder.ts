import { Param, ParamHistory } from "../models/param";
import ParamsManager from "../params_manager";
import ParamPagesHolder from "./param_pages_holder";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";

export interface CalculatedParams {
  history: ParamHistory[];
  averages: Param[];
}

export default class CalculatedParamsHolder extends LazyDerivedValueNotifier<CalculatedParams | null> {
  constructor(
    paramsManager: ParamsManager,
    paramPagesHolder: ParamPagesHolder
  ) {
    super([paramPagesHolder], ([paramPagesHolder], _) => {
      if (paramPagesHolder.state.length === 0) {
        return null;
      }

      const history = paramsManager.getParametersArray(paramPagesHolder.state);
      const averages = paramsManager.calculateAverages(history);

      return {
        history,
        averages,
      };
    });
  }
}
