package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Schedule slot details from UNITEPC Central Gateway.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ScheduleSlotDto(
        String day,
        String startTime,
        String endTime,
        String classroom,
        String campus
) {}
