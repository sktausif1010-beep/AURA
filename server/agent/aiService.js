const axios = require("axios");

/*
==================================================
 AURA AI SERVICE
==================================================

This service communicates with the local Ollama
instance used by the AURA investigation agent.

Default:
  Ollama: http://localhost:11434
  Model:  llama3.2:3b

Environment variables can override these values:

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT=45000
OLLAMA_KEEP_ALIVE=5m
==================================================
*/


// ==================================================
// CONFIGURATION
// ==================================================

const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  "http://localhost:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  "llama3.2:3b";

const OLLAMA_TIMEOUT =
  Number(
    process.env.OLLAMA_TIMEOUT
  ) || 45000;

const OLLAMA_KEEP_ALIVE =
  process.env.OLLAMA_KEEP_ALIVE ||
  "5m";


// ==================================================
// ASK AI
// ==================================================

async function askAI(prompt) {

  if (
    !prompt ||
    typeof prompt !== "string"
  ) {
    throw new Error(
      "AURA AI received an invalid prompt."
    );
  }


  console.log(
    "=========================================="
  );

  console.log(
    "AURA AI: starting Ollama reasoning..."
  );

  console.log(
    `AURA AI: model = ${OLLAMA_MODEL}`
  );

  console.log(
    `AURA AI: endpoint = ${OLLAMA_URL}`
  );

  console.log(
    `AURA AI: prompt length = ${prompt.length}`
  );


  const startTime =
    Date.now();


  try {

    // ------------------------------------------
    // OLLAMA REQUEST
    // ------------------------------------------

    const response =
      await axios.post(

        `${OLLAMA_URL}/api/generate`,

        {
          model:
            OLLAMA_MODEL,

          prompt,

          stream:
            false,

          /*
           * Ask Ollama to return JSON.
           *
           * This works together with the
           * JSON parsing and validation in
           * auraAgent.js.
           */

          format:
            "json",

          keep_alive:
            OLLAMA_KEEP_ALIVE,

          options: {

            /*
             * Deterministic responses are
             * preferred for investigation.
             */

            temperature:
              0,

            /*
             * Keep the response reasonably
             * short because the agent expects
             * a structured JSON response.
             */

            num_predict:
              220
          }
        },

        {
          timeout:
            OLLAMA_TIMEOUT,

          headers: {
            "Content-Type":
              "application/json"
          }
        }

      );


    // ------------------------------------------
    // CALCULATE RESPONSE TIME
    // ------------------------------------------

    const elapsed =
      (
        (Date.now() - startTime) /
        1000
      ).toFixed(2);


    console.log(
      `AURA AI: reasoning completed in ${elapsed}s`
    );


    // ------------------------------------------
    // VALIDATE RESPONSE
    // ------------------------------------------

    if (
      !response ||
      !response.data
    ) {

      throw new Error(
        "Ollama returned an empty response."
      );

    }


    const aiResponse =
      response.data.response;


    if (
      !aiResponse ||
      typeof aiResponse !== "string"
    ) {

      throw new Error(
        "Ollama returned an invalid AI response."
      );

    }


    console.log(
      `AURA AI: response length = ${aiResponse.length}`
    );


    console.log(
      "=========================================="
    );


    return aiResponse;


  } catch (error) {

    const elapsed =
      (
        (Date.now() - startTime) /
        1000
      ).toFixed(2);


    console.error(
      "=========================================="
    );

    console.error(
      `AURA AI failed after ${elapsed}s`
    );


    // ------------------------------------------
    // AXIOS / OLLAMA ERROR
    // ------------------------------------------

    if (error.response) {

      console.error(
        "AURA AI HTTP status:",
        error.response.status
      );

      console.error(
        "AURA AI response:",
        error.response.data
      );

    }

    // ------------------------------------------
    // TIMEOUT
    // ------------------------------------------

    else if (
      error.code ===
      "ECONNABORTED"
    ) {

      console.error(
        "AURA AI: Ollama request timed out."
      );

    }

    // ------------------------------------------
    // CONNECTION REFUSED
    // ------------------------------------------

    else if (
      error.code ===
      "ECONNREFUSED"
    ) {

      console.error(
        "AURA AI: Ollama connection refused."
      );

      console.error(
        "Make sure Ollama is running."
      );

    }

    // ------------------------------------------
    // OTHER ERROR
    // ------------------------------------------

    else {

      console.error(
        "AURA AI error:",
        error.message
      );

    }


    console.error(
      "=========================================="
    );


    throw new Error(
      "AURA AI reasoning timed out or Ollama is unavailable."
    );

  }
}


// ==================================================
// OPTIONAL HEALTH CHECK
// ==================================================

async function checkOllamaConnection() {

  try {

    const response =
      await axios.get(
        `${OLLAMA_URL}/api/tags`,
        {
          timeout: 5000
        }
      );


    return {
      connected: true,
      models:
        response.data?.models || []
    };

  } catch (error) {

    console.error(
      "AURA AI: Ollama health check failed:",
      error.message
    );


    return {
      connected: false,
      models: []
    };

  }
}


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  askAI,
  checkOllamaConnection
};