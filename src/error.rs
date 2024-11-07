use serde::Serialize;

/// Struct representing error
#[derive(Serialize, Clone)]
pub struct Error {
    /// main error message
    message: String,
    /// error
    errors: Vec<String>,
}

fn get_errors<E>(error: E) -> Vec<String>
where
    E: std::error::Error,
{
    let mut errors = vec![error.to_string()];
    if let Some(source) = error.source() {
        errors.extend(get_errors(source));
    }
    errors
}

/// trait which add message to [`std::error::Error`]
pub trait Message<T> {
    /// Add message
    ///
    /// # Errors
    /// If message was added successfully
    fn message<M>(self, message: M) -> Result<T, Error>
    where
        M: ToString;
}

impl<T, E> Message<T> for Result<T, E>
where
    E: std::error::Error,
{
    fn message<M>(self, message: M) -> Result<T, Error>
    where
        M: ToString,
    {
        self.map_err(|err| {
            Error {
                message: message.to_string(),
                errors: get_errors(err),
            }
        })
    }
}
