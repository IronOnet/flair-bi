package com.flair.bi.service.dto.scheduler;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class GetSearchReportsDTO {
	private final Integer totalRecords;
	private final List<SchedulerNotificationDTO> reports;
}
