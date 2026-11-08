/**
 * Shared result model for Preview-only query/output adapters.
 *
 * Query adapters never change exported .mcfunction syntax. They only describe
 * how confidently the MakeCode runtime can reproduce output that player.execute()
 * does not expose to the user.
 */
namespace MCFunctionPreview {
    export enum QueryConfidence {
        Exact = 0,
        SessionKnown = 1,
        Partial = 2,
        Unavailable = 3
    }

    export interface QueryResult {
        handled: boolean;
        confidence: QueryConfidence;
        summary: string;
    }

    export function unhandledQuery(): QueryResult {
        return {
            handled: false,
            confidence: QueryConfidence.Unavailable,
            summary: ""
        };
    }

    export function handledQuery(
        confidence: QueryConfidence,
        summary: string
    ): QueryResult {
        return {
            handled: true,
            confidence: confidence,
            summary: summary
        };
    }
}
