const TestScenario = require("../models/TestScenario");
const { EventEmitter } = require("events");

/**
 * Test Scenario Management Service
 *
 * Manages test scenarios, their execution, and lifecycle
 */
class TestScenarioService extends EventEmitter {
  constructor() {
    super();
    this.scenarios = new Map();
    this.activeScenarios = new Set();
    this.scenarioTemplates = new Map();
  }

  /**
   * Initialize service with default scenarios
   */
  async initialize() {
    try {
      // Load default scenario templates
      const defaultScenarios = TestScenario.generateTestScenarios();

      defaultScenarios.forEach((scenario) => {
        this.scenarios.set(scenario.id, scenario);
        this.scenarioTemplates.set(scenario.category, scenario);
      });

      this.emit("initialized", { scenarioCount: this.scenarios.size });
      return { success: true, scenarioCount: this.scenarios.size };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }

  /**
   * Create new test scenario
   */
  async createScenario(data) {
    try {
      const scenario = new TestScenario(data);
      const validation = scenario.validate();

      if (!validation.isValid) {
        throw new Error(
          `Invalid scenario data: ${validation.errors.join(", ")}`
        );
      }

      this.scenarios.set(scenario.id, scenario);
      this.emit("scenarioCreated", { scenarioId: scenario.id, scenario });

      return { success: true, scenario };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "createScenario" });
      throw error;
    }
  }

  /**
   * Get scenario by ID
   */
  async getScenario(scenarioId) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      return { success: true, scenario };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getScenario",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Update scenario
   */
  async updateScenario(scenarioId, data) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      const validation = scenario.update(data);

      if (!validation.isValid) {
        throw new Error(
          `Invalid scenario data: ${validation.errors.join(", ")}`
        );
      }

      this.scenarios.set(scenarioId, scenario);
      this.emit("scenarioUpdated", { scenarioId, scenario });

      return { success: true, scenario };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "updateScenario",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Delete scenario
   */
  async deleteScenario(scenarioId) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      // Check if scenario is active
      if (this.activeScenarios.has(scenarioId)) {
        throw new Error(`Cannot delete active scenario: ${scenarioId}`);
      }

      this.scenarios.delete(scenarioId);
      this.emit("scenarioDeleted", { scenarioId });

      return { success: true };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "deleteScenario",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * List scenarios with filters
   */
  async listScenarios(filters = {}) {
    try {
      const scenarios = Array.from(this.scenarios.values())
        .filter((scenario) => scenario.matches(filters))
        .map((scenario) => scenario.getSummary());

      return { success: true, scenarios, count: scenarios.length };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "listScenarios" });
      throw error;
    }
  }

  /**
   * Get scenarios by category
   */
  async getScenariosByCategory(category) {
    try {
      const scenarios = Array.from(this.scenarios.values())
        .filter((scenario) => scenario.category === category)
        .map((scenario) => scenario.getSummary());

      return { success: true, scenarios, count: scenarios.length };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getScenariosByCategory",
        category,
      });
      throw error;
    }
  }

  /**
   * Get scenarios by priority
   */
  async getScenariosByPriority(priority) {
    try {
      const scenarios = Array.from(this.scenarios.values())
        .filter((scenario) => scenario.priority === priority)
        .map((scenario) => scenario.getSummary());

      return { success: true, scenarios, count: scenarios.length };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getScenariosByPriority",
        priority,
      });
      throw error;
    }
  }

  /**
   * Get active scenarios
   */
  async getActiveScenarios() {
    try {
      const scenarios = Array.from(this.activeScenarios)
        .map((scenarioId) => this.scenarios.get(scenarioId))
        .filter((scenario) => scenario && scenario.isActive)
        .map((scenario) => scenario.getSummary());

      return { success: true, scenarios, count: scenarios.length };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getActiveScenarios",
      });
      throw error;
    }
  }

  /**
   * Activate scenario
   */
  async activateScenario(scenarioId) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      scenario.activate();
      this.activeScenarios.add(scenarioId);
      this.scenarios.set(scenarioId, scenario);

      this.emit("scenarioActivated", { scenarioId, scenario });

      return { success: true, scenario };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "activateScenario",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Deactivate scenario
   */
  async deactivateScenario(scenarioId) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      scenario.deactivate();
      this.activeScenarios.delete(scenarioId);
      this.scenarios.set(scenarioId, scenario);

      this.emit("scenarioDeactivated", { scenarioId, scenario });

      return { success: true, scenario };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "deactivateScenario",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Clone scenario
   */
  async cloneScenario(scenarioId) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      const clonedScenario = scenario.clone();
      this.scenarios.set(clonedScenario.id, clonedScenario);

      this.emit("scenarioCloned", {
        originalId: scenarioId,
        clonedId: clonedScenario.id,
        scenario: clonedScenario,
      });

      return { success: true, scenario: clonedScenario };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "cloneScenario",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Create scenario from template
   */
  async createScenarioFromTemplate(templateCategory, customData = {}) {
    try {
      const template = this.scenarioTemplates.get(templateCategory);

      if (!template) {
        throw new Error(`Template not found: ${templateCategory}`);
      }

      const scenarioData = {
        ...template.toJSON(),
        ...customData,
        id: undefined, // Let it generate new ID
      };

      const scenario = new TestScenario(scenarioData);
      const validation = scenario.validate();

      if (!validation.isValid) {
        throw new Error(
          `Invalid scenario data: ${validation.errors.join(", ")}`
        );
      }

      this.scenarios.set(scenario.id, scenario);
      this.emit("scenarioCreatedFromTemplate", {
        templateCategory,
        scenarioId: scenario.id,
        scenario,
      });

      return { success: true, scenario };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "createScenarioFromTemplate",
        templateCategory,
      });
      throw error;
    }
  }

  /**
   * Get scenario statistics
   */
  async getScenarioStatistics() {
    try {
      const scenarios = Array.from(this.scenarios.values());

      const statistics = {
        total: scenarios.length,
        active: scenarios.filter((s) => s.isActive).length,
        inactive: scenarios.filter((s) => !s.isActive).length,
        byCategory: {},
        byPriority: {},
        byType: {},
      };

      // Group by category
      scenarios.forEach((scenario) => {
        if (!statistics.byCategory[scenario.category]) {
          statistics.byCategory[scenario.category] = 0;
        }
        statistics.byCategory[scenario.category]++;
      });

      // Group by priority
      scenarios.forEach((scenario) => {
        if (!statistics.byPriority[scenario.priority]) {
          statistics.byPriority[scenario.priority] = 0;
        }
        statistics.byPriority[scenario.priority]++;
      });

      // Group by type
      scenarios.forEach((scenario) => {
        if (!statistics.byType[scenario.type]) {
          statistics.byType[scenario.type] = 0;
        }
        statistics.byType[scenario.type]++;
      });

      return { success: true, statistics };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getScenarioStatistics",
      });
      throw error;
    }
  }

  /**
   * Validate scenario for execution
   */
  async validateScenarioForExecution(scenarioId) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      const validation = scenario.validate();
      const isReady = scenario.isReadyForExecution();

      return {
        success: true,
        isValid: validation.isValid,
        isReady,
        errors: validation.errors,
        requirements: scenario.getExecutionRequirements(),
      };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "validateScenarioForExecution",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Get scenario execution requirements
   */
  async getScenarioExecutionRequirements(scenarioId) {
    try {
      const scenario = this.scenarios.get(scenarioId);

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      return {
        success: true,
        requirements: scenario.getExecutionRequirements(),
      };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getScenarioExecutionRequirements",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Clear all scenarios
   */
  async clearAllScenarios() {
    try {
      const count = this.scenarios.size;
      this.scenarios.clear();
      this.activeScenarios.clear();

      this.emit("allScenariosCleared", { count });

      return { success: true, clearedCount: count };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "clearAllScenarios",
      });
      throw error;
    }
  }

  /**
   * Export scenarios
   */
  async exportScenarios() {
    try {
      const scenarios = Array.from(this.scenarios.values()).map((scenario) =>
        scenario.toJSON()
      );

      return { success: true, scenarios, count: scenarios.length };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "exportScenarios",
      });
      throw error;
    }
  }

  /**
   * Import scenarios
   */
  async importScenarios(scenariosData) {
    try {
      const importedScenarios = [];
      const errors = [];

      for (const scenarioData of scenariosData) {
        try {
          const scenario = new TestScenario(scenarioData);
          const validation = scenario.validate();

          if (validation.isValid) {
            this.scenarios.set(scenario.id, scenario);
            importedScenarios.push(scenario);
          } else {
            errors.push(
              `Invalid scenario ${scenarioData.name}: ${validation.errors.join(
                ", "
              )}`
            );
          }
        } catch (error) {
          errors.push(
            `Error importing scenario ${scenarioData.name}: ${error.message}`
          );
        }
      }

      this.emit("scenariosImported", {
        importedCount: importedScenarios.length,
        errorCount: errors.length,
      });

      return {
        success: true,
        importedCount: importedScenarios.length,
        errorCount: errors.length,
        errors,
      };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "importScenarios",
      });
      throw error;
    }
  }
}

module.exports = TestScenarioService;
