package com.flair.bi.repository;

import java.util.stream.Stream;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.flair.bi.domain.QView;
import com.flair.bi.domain.View;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;

/**
 * Spring Data JPA repository for the View entity.
 */
@Repository
public interface ViewRepository
		extends JpaRepository<View, Long>, QuerydslPredicateExecutor<View>, QuerydslBinderCustomizer<QView> {

	@Query(value = "select views from View views where views.viewDashboard.id = :id")
	Stream<View> findByDashboardId(@Param("id") Long id);

	@Query(value = "select view from View view where view.viewDashboard.id = :id and view.viewName=:viewName")
	View findByDashboardIdAndViewName(@Param("id") Long id, @Param("viewName") String viewName);

	@Modifying
	@Query("delete from View v where v.realm.id = :id")
	void deleteAllByRealmId(@Param("id") Long id);

	/**
	 * Customize the {@link QuerydslBindings} for the given root.
	 *
	 * @param bindings the {@link QuerydslBindings} to customize, will never be
	 *                 {@literal null}.
	 * @param root     the entity root, will never be {@literal null}.
	 */
	@Override
	default void customize(QuerydslBindings bindings, QView root) {
		bindings.bind(root.viewDashboard).first((path, value) -> path.id.eq(value.getId()));
		bindings.bind(root.createdBy).first(SimpleExpression::eq);
		bindings.bind(root.viewName).first(StringExpression::containsIgnoreCase);
	}
}
