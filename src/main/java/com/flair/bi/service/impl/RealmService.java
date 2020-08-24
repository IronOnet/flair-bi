package com.flair.bi.service.impl;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.Functions;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import com.flair.bi.domain.VisualizationColors;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.FunctionsRepository;
import com.flair.bi.repository.RealmRepository;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.VisualizationColorsRepository;
import com.flair.bi.service.mapper.RealmMapper;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.web.rest.dto.RealmDTO;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RealmService {

    private final RealmRepository realmRepository;
    private final RealmMapper realmMapper;
    private final UserRepository userRepository;
    private final UserGroupService userGroupService;
    private final PasswordEncoder passwordEncoder;
    private final FunctionsRepository functionsRepository;
    private final VisualizationColorsRepository visualizationColorsRepository;


    @Transactional
    public RealmDTO save(RealmDTO realmDTO) {
        log.debug("Saving realm : {}", realmDTO);
        Realm realm = realmMapper.fromDTO(realmDTO);
        realm = realmRepository.save(realm);
        // TODO create user group service is not done yet
        //userRepository.save(createUser(realm));
        //userGroupService.save(createUserGroup(realm));
        Realm realmV = realmRepository.findByName("vizcentric");
        functionsRepository.saveAll(buildFunctionsList(realm,realmV.getId()));
        visualizationColorsRepository.saveAll(buildVisualizationColorsList(realm,realmV.getId()));
        return realmMapper.toDTO(realm);
    }

    @Transactional(readOnly = true)
    public List<RealmDTO> findAll(Pageable pageable) {
        log.debug("Request to get all realms");
        Page<Realm> entities = realmRepository.findAll(pageable);
        return realmMapper.toDTOs(entities.getContent());
    }

    @Transactional(readOnly = true)
    public Page<Realm> findAll(Predicate predicate, Pageable pageable) {
        log.debug("Request to get all realms");
        Page<Realm> entities = realmRepository.findAll(predicate,pageable);
        return entities;
    }

    @Transactional(readOnly = true)
    public RealmDTO findOne(Long id) {
        log.debug("Request to get Functions : {}", id);
        Realm entity = realmRepository.getOne(id);
        return realmMapper.toDTO(entity);
    }

    @Transactional
    public void delete(Long id) {
        log.debug("Request to delete Functions : {}", id);
        // TODO
        visualizationColorsRepository.deleteByRealmId(id);
        functionsRepository.deleteByRealmId(id);
        realmRepository.deleteById(id);
    }

    private User createUser(Realm realm){
        User newUser = new User();
        newUser.setLogin(realm.getName().trim()+realm.getId());
        String encryptedPassword = passwordEncoder.encode(realm.getName().trim()+realm.getId()+"@123");
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(realm.getName());
        newUser.setLastName("Administrator");
        newUser.setEmail(realm.getName().trim()+realm.getId()+"@localhost");
        newUser.setLangKey(Constants.LanguageKeys.ENGLISH);
        newUser.setActivated(true);
        newUser.setCreatedBy("system");
        newUser.setLastModifiedBy("system");
        newUser.setRealm(realm);
        return newUser;
    }

    private UserGroup createUserGroup(Realm realm){
        UserGroup userGroup = new UserGroup();
        userGroup.setName("ROLE_ADMIN");
        userGroup.setRealm(realm);
        return userGroup;
    }

    private List<Functions> buildFunctionsList(Realm realm,Long realmIdV){
        List<Functions> functions = functionsRepository.findByRealmId(realmIdV)
                .stream()
                .map(f -> {
                    Functions function = new Functions();
                    function.setDescription(f.getDescription());
                    function.dimensionUse(f.isDimensionUse());
                    function.measureUse(f.isMeasureUse());
                    function.setName(f.getName());
                    function.setValidation(f.getValidation());
                    function.setValue(f.getValue());
                    function.setRealm(realm);
                    return function;
                }).collect(Collectors.toList());
        return functions;
    }

    private List<VisualizationColors> buildVisualizationColorsList(Realm realm,Long realmIdV){
        List<VisualizationColors> visualizationColors = visualizationColorsRepository.findByRealmId(realmIdV)
                .stream()
                .map(v ->{
                    VisualizationColors visualizationColor = new VisualizationColors();
                    visualizationColor.setCode(v.getCode());
                    visualizationColor.setRealm(realm);
                    return visualizationColor;
                }).collect(Collectors.toList());
        return visualizationColors;
    }
}