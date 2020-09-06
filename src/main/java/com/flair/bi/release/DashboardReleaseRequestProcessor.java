package com.flair.bi.release;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Component(value = "dashboardReleaseProcessor")
@Transactional
@RequiredArgsConstructor
class DashboardReleaseRequestProcessor implements ReleaseRequestProcessor<DashboardRelease> {

	private final UserService userService;

	private final DashboardService dashboardService;

	@Autowired
	@Lazy // TODO: remove this dependency to avoid cycling dependency issue
	private ReleaseRequestService releaseRequestService;

	@Override
	public ReleaseRequest requestRelease(DashboardRelease entity) {

		User user = userService.getUserWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin())
				.orElseThrow(RuntimeException::new);
		ReleaseRequest request = new ReleaseRequest();
		request.setRequestedBy(user);
		request.setComment(entity.getComment());

		Dashboard dashboard = dashboardService.findOne(entity.getDashboard().getId());

		// since they are fresh releases they do not have assigned version number until,
		// first approved
		entity.setVersionNumber(-1L);
		entity.setRequestedBy(request.getRequestedBy());

		entity.getViewReleases().stream().peek(x -> x.setRequestedBy(user)).filter(x -> x.getVersionNumber() == null)
				.forEach(x -> x.setVersionNumber(-1L));

		List<Long> ids = entity.getViewReleases().stream().map(ViewRelease::getView).map(View::getId)
				.collect(Collectors.toList());

		// add latest releases of other views
		dashboard.getDashboardViews().stream().filter(x -> !ids.contains(x.getId()))
				.filter(x -> x.getCurrentRelease() != null).map(View::getCurrentRelease).forEach(entity::add);

		request.setRelease(entity);
		ReleaseRequest r = releaseRequestService.save(request);
		dashboardService.save(dashboard);
		return r;

	}

}
