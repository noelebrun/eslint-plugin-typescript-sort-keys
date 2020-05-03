import { JSONSchema4 } from 'json-schema';

import { getObjectBody } from 'utils/ast';
import { createReporter } from 'utils/plugin';
import { createRule, RuleMetaData } from 'utils/rule';
import {
  sortingOrderOptionSchema,
  sortingParamsOptionSchema,
  SortingOrder,
  SortingParamsOption,
  SortingOrderOption,
  ErrorMessage,
} from 'common/options';

/**
 * The name of this rule.
 */
export const name = 'string-enum' as const;

/**
 * The options this rule can take.
 */
type Options = [SortingOrderOption] | [SortingOrderOption, Partial<SortingParamsOption>];

/**
 * The schema for the rule options.
 */
const schema: JSONSchema4 = [sortingOrderOptionSchema, sortingParamsOptionSchema];

/**
 * The default options for the rule.
 */
const defaultOptions: Options = [
  SortingOrder.Ascending,
  { caseSensitive: true, natural: false },
];

/**
 * The possible error messages.
 */
const errorMessages = {
  invalidOrder: ErrorMessage.StringEnumInvalidOrder,
} as const;

/**
 * The meta data for this rule.
 */
const meta: RuleMetaData<keyof typeof errorMessages> = {
  type: 'suggestion',
  docs: {
    description: 'require string enum members to be sorted',
    category: 'Stylistic Issues',
    recommended: 'warn',
  },
  messages: errorMessages,
  fixable: 'code',
  schema,
};

/**
 * Create the rule.
 */
export const rule = createRule<keyof typeof errorMessages, Options>({
  name,
  meta,
  defaultOptions,

  create(context) {
    const compareNodeListAndReport = createReporter(context, currentNode => ({
      loc: currentNode.key ? currentNode.key.loc : currentNode.loc,
      messageId: 'invalidOrder',
    }));

    return {
      TSEnumDeclaration(node) {
        const body = getObjectBody(node);
        const isStringEnum = body.every(
          member =>
            member.initializer &&
            member.initializer.type === 'Literal' &&
            typeof member.initializer.value === 'string',
        );

        if (isStringEnum) {
          compareNodeListAndReport(body);
        }
      },
    };
  },
});