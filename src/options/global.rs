use serde::{Deserialize, Serialize};
use specta::Type;

/// Global options
#[derive(Serialize, Deserialize, Clone, Type)]
pub struct GlobalOptions {
    /// name of option
    name: String,
    /// A detailed description of the option
    description: String,
    /// The command-line flag associated with the option
    flag: String,
    /// The type of the option and any additional properties specific to that
    /// type.
    #[serde(flatten)]
    option: OptionDefinition,
}

/// Defines the type of a global option and its specific properties.
#[derive(Serialize, Deserialize, Clone, Type)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum OptionDefinition {
    /// A string-type option, with an optional list of valid choices.
    String {
        /// A list of allowed string values for this option (if applicable).
        choices: Option<Vec<String>>,
    },
    /// A boolean-type option, with properties specific to boolean behavior.
    Boolean {
        /// Indicates whether the `no` prefix is supported for negating the
        /// option.
        support_no_prefix: bool,
        /// Custom values to represent the boolean states (true/false).
        values: Option<TrueFalseValue>,
    },
}

/// Represents custom string values for `true` and `false` states in a boolean
/// option.
#[derive(Serialize, Deserialize, Clone, Type)]
pub struct TrueFalseValue {
    /// The string representation of the `true` state
    #[serde(rename = "true")]
    true_value: String,
    /// The string representation of the `false` state
    #[serde(rename = "false")]
    false_value: String,
}

impl GlobalOptions {
    /// Get all valid global options as vector of list
    #[must_use]
    pub(crate) fn all() -> Vec<Self> {
        vec![
            Self {
                name: "repeat log".to_string(),
                description: "Repeat a log output instead of compressing it".to_string(),
                flag: "loglevel".to_string(),
                option: OptionDefinition::Boolean {
                    support_no_prefix: false,
                    values: Some(TrueFalseValue {
                        true_value: "repeat".to_string(),
                        false_value: "-repeat".to_string(),
                    }),
                },
            },
            Self {
                name: "prefix [level] log".to_string(),
                description: "Prefix [level] to each message line".to_string(),
                flag: "loglevel".to_string(),
                option: OptionDefinition::Boolean {
                    support_no_prefix: false,
                    values: Some(TrueFalseValue {
                        true_value: "level".to_string(),
                        false_value: "-level".to_string(),
                    }),
                },
            },
            Self {
                name: "loglevel".to_string(),
                description: "Set logging level".to_string(),
                flag: "loglevel".to_string(),
                option: OptionDefinition::String {
                    choices: Some(vec![
                        "quiet".to_string(),
                        "panic".to_string(),
                        "fatal".to_string(),
                        "error".to_string(),
                        "warning".to_string(),
                        "info".to_string(),
                        "verbose".to_string(),
                        "debug".to_string(),
                        "trace".to_string(),
                    ]),
                },
            },
            Self {
                name: "report".to_string(),
                description: "Dump full command line and log output to a file".to_string(),
                flag: "report".to_string(),
                option: OptionDefinition::Boolean {
                    support_no_prefix: false,
                    values: None,
                },
            },
            Self {
                name: "hide banner".to_string(),
                description: "Suppress printing banner".to_string(),
                flag: "hide_banner".to_string(),
                option: OptionDefinition::Boolean {
                    support_no_prefix: false,
                    values: None,
                },
            },
            Self {
                name: "overwrite file".to_string(),
                description: "Overwrite output file without asking".to_string(),
                flag: "y".to_string(),
                option: OptionDefinition::Boolean {
                    support_no_prefix: false,
                    values: None,
                },
            },
            Self {
                name: "do not overwrite file".to_string(),
                description: "Do not overwrite output files, and exit immediately if a specified \
                              output file already exists."
                    .to_string(),
                flag: "n".to_string(),
                option: OptionDefinition::Boolean {
                    support_no_prefix: false,
                    values: None,
                },
            },
            Self {
                name: "show stats".to_string(),
                description: "Print progress report during encoding".to_string(),
                flag: "stats".to_string(),
                option: OptionDefinition::Boolean {
                    support_no_prefix: true,
                    values: None,
                },
            },
        ]
    }
}
