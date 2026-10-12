/** Bedrock/Education PARTICLE command AST. The emitter position is optional. */
namespace MCFunctionAST {
    export interface ParticleCommand extends CommandNode {
        kind: CommandKind;
        particleId: string;
        position?: Position;
    }

    export function createParticleCommand(
        particleId: string,
        position?: Position
    ): ParticleCommand {
        return {
            kind: CommandKind.Particle,
            particleId: particleId,
            position: position
        };
    }
}
