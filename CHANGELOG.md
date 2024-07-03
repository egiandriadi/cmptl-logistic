# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.3] - 2024-06-26

### Fixed
- Fixed error handling axios IDEx
- Fixed error handling create order IDEx
- Fixed missing audittrail when error create order JNE

### Changed
- Changed timeout and status code error API IDEx
- Changed logic check duplicate order

## [1.1.2] - 2024-06-12

### Fixed
- Prevent for webhook timestamp before order last_update to update status
- Update last_update order when hit the api webhook

### Added
- Add return information for JNE

## [1.1.1] - 2024-06-12

### Changed 
- Update cell number of `nomor_resi` and `nominal_ekspedisi`

## [1.1.0] - 2024-06-12

### Changed
- Changed sorting flat rate variations by the cheapest price first

## [1.0.0] - 2024-06-05
### Changed
- Changed tracking limit from 100 to 50.
- Changed AWB tracking status updates.

### Fixed
- Fixed some bugs to billing / `tagihan` and `requestFlatRateDto` in the `ninjaController`.
- Fixed an issue with `DELIVERY_EXCEPTIPTION` typo.
- Resolved an issue where RTS photos were not shown.
- Fixed sort order history log order by `created_at` desc.
- Removed validation for addresses exceeding 85 characters for JNE, split into 2 attributes.
- Fixed an issue where SAP was unable to cancel.
- Fixed an issue where images were not appearing.
- Fixed sorting order status history bug.

### Added
- Added health check API.
- Added flat / special rate feature.

## [0.2.5] - 2024-05-03
### Added
- Added tracking AWB status
- Added failure reasons.

### Fixed
- Fixed migration script for failure reasons.

## [0.2.4] - 2024-04-26
### Added
- Added pod code for JNE.
- Added SAP tracking.
- Seeder added for migrating existing logs to failure reasons.

### Changed
- Updated schema database for the expedition service.
- Updated handling of update reconciliation.
- Updated JNE tracking.

### Fixed
- Fixed issue where reconciliation update was not being reflected.
- Disabled GitHub action temporarily.
- Fixed database schema.

## [0.2.3] - 2024-04-12
### Added
- Added DTO response for tracking status in IDExpress.

### Changed
- Updated IDExpress tracking.
- Minimum value of goods adjusted to 0.
- Adjusted validation for claim.
- Updated check tariff to use JNE production key and working JNE tracking.

### Fixed
- Fixed injection failure reason on webhook.
- Pull schema database.
- Fixed strict rules in JNE integration and squad ninja adjustments.

## [0.2.2] - 2024-04-05
### Added
- Added tracking status for IDExpress.

### Changed
- Added production environment key on check tariff & get tracking status.
- Updated status response.

### Fixed
- Fixed logging and response handling.
- Fixed strict rules in JNE integration.

## [0.2.1] - 2024-04-05
### Added
- Added image for Ninja log in Ekspedisilog.
- Base SAP implementation.

### Changed
- Updated required data validation.

### Removed
- Removed validation for IDExpress webhook.

### Miscellaneous

## [0.2.0] - 2024-03-01
### Added
- Append proof ninja log history if delivery exception.
- Added validation for undefined weight, default to 1.
- Added validation if Ninja ratecard amount is 0.
- Updated webhook to follow global timezone.
- Limit validation packing note to 60 characters.
- Added status history logs for IDExpress and Ninja.
- Added failure reason for IDExpress and Ninja.
- Added feature to handle JNE cancel order webhook.
- Added score for expedition recommendation.
- Added environment variables for customer ID and COD account.

### Changed
- Refactored various parts of the code for better readability and performance.
- Updated JNE status log history.
- Updated Ninja configuration and removed COD fee for Ninja.
- Updated recommendation for JNE.
- Updated message and response structures.
- Updated Docker configurations.
- Updated base validation and schema for various services.
- Updated handling of insured value and delivery notes.
- Updated handling of token checking for Ninja service.
- Updated response tariff recommendation for Ninja.
- Improved logging for various actions and services.
- Enhanced validation and error handling across multiple services.

### Fixed
- Fixed SAP unhandled error response, trimmed status.
- Fixed issue with Ninja response check tariff when null.
- Fixed issue with JNE status update.
- Fixed insured value and delivery notes.
- Fixed conflicts in update webhook Ninja service.
- Fixed JNE strict rules.
- Fixed issue with Ninja integration.
- Fixed ctc type tariff for Ninja.
- Fixed various issues with IDExpress and JNE webhook handling.
- Fixed mapping status for JNE reverse history.
- Fixed calculation of weight, rounding for check tariff, get recommendation, and create order.
- Fixed Ninja token update and logging.

### Removed
- Removed SSL connection for MySQL.
- Removed unused MySQL configurations.
- Cleaned up code by removing console logs and unused variables.

## [0.1.0] - 2024-02-01
### Added
- Add interface for IDExpress location repository.
- Add feature to create order for IDExpress.
- Add feature to check tariff for IDExpress.
- Add Dockerfile and workflows for Docker.
- Add API to cancel orders for Ninja.
- Add validation for sending WhatsApp messages in webhook expeditions.
- Add post-create validation for claims.
- Added missing dependencies.
- First working request with audit trail and create order with response.

### Changed
- Refactor code.
- Update path and error responses.
- Update data payload.
- Update base endpoint for Ninja.
- Update response handling from API.
- Update check tariff response.
- Update insurance integration for Ninja.
- Update handling for COD and non-COD accounts.
- Update access token information in audit trail.
- Update Prisma CLI to version 5.9.1.
- Adjustment for sprint 7, including cancel order service and API adjustments.
- Integrate expeditions on order rejection.
- Move access token information to audit trail.
- Update billing weight.
- Adjust path initialization.
- Reconfigured Dockerfile.

### Fixed
- Fixed payload type and added weight for check tariff.
- Fixed response handler for API updates.
- Fixed workflow and Dockerfile issues.
- Fixed column update for `jumlah resi`.
- Fixed validation for claims creation.
- Minor fix remapping requests.

### Removed
- Removed function to send WhatsApp messages.
- Removed postfix backend from Docker.
- Skipped token generation on start.
- Ignored migrations for Knex.

## [0.0.4] - 2024-01-01
### Added
- Added Prisma schema.

### Changed
- Updated Ninja controller.
- Updated data payload.
- Moved access token information to audit trail.
- Updated base endpoint for Ninja.
- General updates.

## [0.0.3] - 2023-12-01
### Added
- Add feature `rekonsiliasi`.
- Add cron job for scheduling tasks.

### Changed
- Update mapping images on tracking.
- Update access token in audit trail.
- Update Try-Catch with retry logic.
- Move function to add reconciliation for Ninja.
- Update condition for reconciliation upload.
- Update schema for Prisma.
- Update Ninja controller.
- Update billing controller.
- Update batch billing.

### Fixed
- Fixed response for JNT data return.
- Provide 200 response.

## [0.0.2] - 2023-11-01
### Added
- Add new feature on Order Ninja.
- Add ServicesType on Check Tarif.
- Added filter for service type.
- Adding Knex.
- Webhook Ninja.
- Mapping New Ninja Webhook.
- Tracking Order.
- Adding `cod_price` on Ninja gateway.
- Try-catch implementation.
- OOC (out of converage).

### Changed
- Revamp Object.
- Update Ninja controller.
- Change order by.
- Revamp JS to TS & init Ninja logistic services.
- Transform to JS.
- Returning Sync to false.

### Fixed
- Fixed response for recommendations.
- Fixed JSON format for Ninja order.
- Fixed date format.
- Update Knex migration for ekspedisi log.

## [0.0.1] - 2023-10-01
### Added
- Initial release of the project.
- Updated the `mapping` folder.