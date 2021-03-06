package com.flair.bi.web.rest;

import java.net.URISyntaxException;
import java.util.Set;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.domain.ViewFeatureCriteria;
import com.flair.bi.service.ViewFeatureCriteriaService;
import com.flair.bi.web.rest.dto.CreateViewFeatureCriteriaRequest;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class ViewFeatureCriteriaResource {

	private final ViewFeatureCriteriaService viewFeatureCriteriaService;

	@PostMapping("/view-feature-criteria")
	@Timed
	public ResponseEntity<Set<ViewFeatureCriteria>> createViewFeatureCriteria(
			@Valid @RequestBody CreateViewFeatureCriteriaRequest viewFeatureCriteria) throws URISyntaxException {
		log.debug("REST request to save ViewFeatureCriteria : {}", viewFeatureCriteria);
		Set<ViewFeatureCriteria> result = viewFeatureCriteriaService.create(viewFeatureCriteria);
		return ResponseEntity.ok(result);
	}

}
