package com.flair.bi.web.rest.dto;

import java.util.List;

import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
public class CreateViewFeatureCriteriaRequest {

	@NotNull
	private Long viewId;

	private List<ViewFeatureData> features;

	@Data
	public static class ViewFeatureData {
		@NotNull
		private String value;
		@NotNull
		private Long featureId;
		private String metadata;
	}
}
