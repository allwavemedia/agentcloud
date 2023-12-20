use actix_web::error::ResponseError;
use actix_web::{http::StatusCode, HttpResponse};
use anyhow::Error;
use mongodb::error::Error as MongoError;
use thiserror::Error as ThisError;

#[derive(Debug, ThisError)]
pub enum CustomErrorType {
    #[error("an unspecified internal error occurred: {0}")]
    InternalError(#[from] Error),
    #[error("a standard error occurred: {0}")]
    StdError(#[from] Box<dyn std::error::Error>),
    #[error("Mongo DB error occurred: {0}")]
    MongoError(#[from] MongoError),
}

impl ResponseError for CustomErrorType {
    fn status_code(&self) -> StatusCode {
        match self {
            CustomErrorType::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            CustomErrorType::StdError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            CustomErrorType::MongoError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).body(self.to_string())
    }
}

// Short hand alias, which allows you to use just Result<T>
pub type Result<T> = std::result::Result<T, CustomErrorType>;
